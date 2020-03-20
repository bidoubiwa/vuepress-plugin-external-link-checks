const cheerio = require("cheerio")
const chalk = require("chalk")
const axios = require("axios")

const log = (msg, color = "blue", label = "CHECK-DEAD-LINKS") => console.log(`\n${chalk.reset.inverse.bold[color](` ${label} `)} ${msg}`)

// TODO: shoud process stop if deadLink is found ?
let deadLinkCount = 0

function stripLocalePrefix (path, localePathPrefixes) {
	const matchingPrefix = localePathPrefixes.filter(prefix => path.startsWith(prefix)).shift()
	return { normalizedPath: path.replace(matchingPrefix, "/"), localePrefix: matchingPrefix }
}

function localCheck(baseURL, docURL, siteMap) {
	let foundUrl = siteMap.get(docURL.pathname)
	if (foundUrl) {
		if (docURL.hash && !foundUrl.headers.includes(docURL.hash)) {
			deadLinkCount++
			console.log(chalk.red(`${chalk.blue.underline.bold(docURL.href)} in ${chalk.blue.underline.bold(baseURL)} is a dead link`))
		}
		else {
			console.log(chalk.green(`${chalk.blue.underline.bold(docURL.href)} is alive!`))
		}
	} else {
		deadLinkCount++
		console.log(chalk.red(`${chalk.blue.underline.bold(docURL.href)} in ${chalk.blue.underline.bold(baseURL)} is a dead link`))
	}
}

// TODO check hashs
async function onlineCheck(baseURL, docURL, checkedLinks) {
	try {
		let checkLink = await axios(docURL.href)
		if (checkLink.status !== 200) {
			deadLinkCount++
			console.log(chalk.red(`${chalk.blue.underline.bold(docURL.href)} in ${chalk.blue.underline.bold(baseURL)} is dead - ${checkLink.status}`))
		} else {
			checkedLinks.push(docURL.href)
			console.log(chalk.green(`${chalk.blue.underline.bold(docURL.href)} is alive!`))
		}
		return checkedLinks
	}
	catch(e) {
		if (e.response && e.response.status) {
			deadLinkCount++
			console.log(chalk.red(`${chalk.blue.underline.bold(docURL.href)} in ${chalk.blue.underline.bold(baseURL)} is dead - ${e.response.status}`))
			return checkedLinks
		}
		throw new Error(e)
	}
}

async function checkExternalLinks ({externalLinks, siteMap, local,  hostname})  {

	let checkedLinks = []
	for (let i = 0; i < externalLinks.length; i++) {
		try {
			log(`Checking ${chalk.blue.underline.bold(externalLinks[i])}`, "magenta")
			let website = await axios.get(externalLinks[i])
			const $ = cheerio.load(website.data)
			let links = Array.from($("a")) //get all hyperlinks
			for (let j = 0; j < links.length; j++) {
				let myURL
				try {
					myURL = new URL($(links[j]).attr("href"))
				} catch (_){
					// The URL was not a valid URL
				}
				if (myURL) {
					if (myURL.hostname === hostname && !checkedLinks.includes(myURL.href)) {
						if (local) localCheck(externalLinks[i], myURL, siteMap)
						else  {
							checkedLinks = await onlineCheck(externalLinks[i], myURL, checkedLinks)
						}
					}
					else if (checkedLinks.includes(myURL.href)){
						console.log(chalk.green(`${chalk.blue.underline.bold(myURL.href)} is alive!`))
					}
				}
			}
		}
		catch (e) {
			if (e.isAxiosError) {
				log(chalk.red(`${e.response.config.url} answered with status ${e.response.status}`), "red")
			}
			throw new Error(e.message)
		}
	}
	if (deadLinkCount > 0) {
		log(`${deadLinkCount} dead link${(deadLinkCount === 1) ? "" : "s"} have been found`, "red")
	}
	else {
		log("No dead links have been found", "green")
	}
}

module.exports = (options, context) => {
	const {
		local = (options.online === true || options.online === "true" ) ? false : true,
		urls = [],
		hostname,
		exclude
	} = options
	return {
		generated () {
			try {
				if (!hostname) {
					let error = new Error("Not generating sitemap because required \"hostname\" option doesn't exist")
					error.isCheckDeadLinkError = true
					throw error
				}
				try {
					let test = new URL(`http://${hostname}`)
					if (test.hostname !== hostname) {
						let error = new Error("Not generating sitemap because required \"hostname\" is badly formatted")
						error.isCheckDeadLinkError = true
						throw error
					}
				} catch (_) {
					let error = new Error("Not generating sitemap because required \"hostname\" is badly formatted")
					error.isCheckDeadLinkError = true
					throw error
				}
				let siteMap = new Map()

				if (!options.online) {
					const { pages, locales, base } = context.getSiteData
						? context.getSiteData()
						: context

					const withBase = url => base.replace(/\/$/, "") + url
					// Sort the locale keys in reverse order so that longer locales, such as '/en/', match before the default '/'
					const localeKeys = (locales && Object.keys(locales).sort().reverse()) || []
					const localesByNormalizedPagePath = pages.reduce((map, page) => {
						const { normalizedPath, localePrefix } = stripLocalePrefix(page.path, localeKeys)
						const prefixesByPath = map.get(normalizedPath) || []
						prefixesByPath.push(localePrefix)
						return map.set(normalizedPath, prefixesByPath)
					}, new Map())


					pages.forEach(page => {
						const fmOpts = page.frontmatter.sitemap || {}
						const metaRobots = (page.frontmatter.meta || [])
							.find(meta => meta.name === "robots")
						const excludePage = metaRobots
							? (metaRobots.content || "").split(/,/).map(x => x.trim()).includes("noindex")
							: fmOpts.exclude === true

						if (excludePage) {
							exclude.push(page.path)
						}

						const { normalizedPath } = stripLocalePrefix(page.path, localeKeys)
						const relatedLocales = localesByNormalizedPagePath.get(normalizedPath)

						let links = []
						// TODO: add multilanguage
						if (relatedLocales.length > 1) {
							links = relatedLocales.map(localePrefix => {
								return {
									lang: locales[localePrefix].lang,
									url: withBase(normalizedPath.replace("/", localePrefix))
								}
							})
						}

						siteMap.set(
							page.path,
							{
								path: page.regularPath,
								headers: (page.headers) ? page.headers.map(header => `#${header.slug}`) : [],
								links
							})
					})
				}
				checkExternalLinks({ externalLinks: urls, siteMap, local,  hostname})
			}
			catch(e) {
				// console.error(chalk.bold.red(error.message || error.msg || error))
				log(e.message,"red")
				if (!e.isCheckDeadLinkError) console.error(chalk.bold.red(e.stack))
				process.exit(1)
			}
		}
	}
}

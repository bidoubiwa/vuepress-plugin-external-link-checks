#!/usr/bin/env node

let program = require("commander")
const chalk = require("chalk")
const esm = require("esm")
const { existsSync, readFileSync } = require("fs")
const { resolve } = require("path")
const pkg = require("./package.json")
const make = require(".")

program
	.version(pkg.version)
	.option("-H, --hostname <hostname>", "website hostname")
	.option("-u, --urls [urls]", "List of external urls to check for dead links", (val) =>
		val.split(",")
	)
	.option("-C, --config-file [configFile]", "path to config file, by default looks for externallinkcheckrc at the root of the project")
	.option("-s, --site-data [siteData]", "vuepress sitedata dir")
	.option("-o, --online", "Check for link in online documentation. If not provided, check in local")
	.parse(process.argv)

if (!process.argv.slice(2).length) {
	program.outputHelp(chalk.green)
	process.exit()
}

try {
	let siteData
	let configFile
	let options

	if (!program.configFile) {
		configFile = resolve(process.cwd(), ".externallinkchecksrc")
	} else {
		configFile = resolve(process.cwd(), program.configFile)
	}
	if (configFile && existsSync(configFile)) {
		let config = JSON.parse(readFileSync(configFile, "utf-8"))

		options = {...config, ...program }
	}
	else {
		options = { ...program }
	}
	// Check for hostname
	if (!options.hostname) {
		let error = new Error("Missing hostname")
		error.isCheckDeadLinkError = true
		throw error
	}

	if (!options.online) {
		let tempDir = options.siteData || ""

		if (!tempDir) {
			const legacyTempDir = resolve("node_modules/vuepress/lib/app/.temp")
			tempDir = existsSync(legacyTempDir)
				? legacyTempDir
				: resolve("node_modules/@vuepress/core/.temp/internal")
		} else {
			const stableDir = resolve(tempDir, "internal")
			tempDir = existsSync(stableDir) ? stableDir : resolve(tempDir)
		}

		const siteDataFile = resolve(tempDir, "siteData.js")

		if (!existsSync(siteDataFile)) {
			let error = new Error("Can't find siteData in dir, please build first or supply the dir manually (--site-data)")
			error.isCheckDeadLinkError = true
			throw error
		}
		const requires = esm(module)
		siteData = requires(siteDataFile).siteData
	}

	make(options, siteData).generated()
} catch (error) {
	console.error(chalk.bold.red(error.message || error.msg || error))
	if (!error.isCheckDeadLinkError) console.error(chalk.bold.red(error.stack))
	else program.outputHelp(chalk.white)
	process.exit(1)
}

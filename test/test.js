const { expect } = require("chai")
const path = require("path")
const cmd = require(path.join(__dirname,"../utils/cmd"))
const cliPath = path.join(__dirname, "../cli.js")
const tempfile = path.resolve(process.cwd(), "test/vuepress")

describe("The dead link checker CLI errors", () => {
	it("Should output error because hostname is missing", async () => {
		try {
			await cmd.execute(cliPath, ["-s", `${tempfile}`])
		} catch (e) {
			let error = e.trim()
			expect(error).to.equal(
				"Missing hostname"
			)
		}
	})

	it("Should output error because local siteData.js is missing", async () => {
		try {
			await cmd.execute(cliPath, ["-H", "docs.meilisearch.com"])
		} catch (e) {
			if (typeof e === "object") {
				console.log({ ...e })
				throw e
			}

			let error = e.trim()
			expect(error).to.equal(
				"Can't find siteData in dir, please build first or supply the dir manually (--site-data)"
			)
		}
	})
})

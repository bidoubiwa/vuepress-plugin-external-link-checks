# vuepress-external-link-check

Given a list of external links, this package will test if all the links found in those external pages that match the vuepress website's hostname are still alive.

You can run the test against your local vuepress routing using the (soon to come) vuepress plugin, or you can run the test against your online vuepress.

## Features

![](./assets/demo.png)

- Will check all the links to a given domain in the given url list:
    - Comparing it with locally generated links, when building your vuepress in development
    - Comparing it with your online documentation.

### Locally
When building your vuepress application a siteData file is generated which contains all the routes of your documentation.
After fetching all HTML from the given `urls` list, this package will retrieve all links with the given `hostname` in the different fetched HTMLs. The urls found will be searched in the siteData file. If not present a warning will be raised. This means your link does not exists in your new build.

### Online

Given that your documentation is already online and you would like to check if all the links to your documentation in the given `urls` list are still alive.
This package will fetch the HTML from all the `urls` given and retrieve all links pointing to the given `hostname`. It will ping all those links, if they do not result in a success a warning will be raised. This means the link is dead.

**The online mode `-o` has nothing to do with vuepress and should be moved to its own package.**

## Install

```bash
yarn add vuepress-external-link-check
```

## try out

```bash
$ npx vuepress-external-link-check -t test/vuepress -H docs.meilisearch.com
```
or
```bash
$ cd examples
$ ./docs.meilisearch.sh
```

### Options

| CLI option    | Config file option    | Type      |   Description | Default value |
| ---           | ---                   |      ---  |  ---          | ---           |
| -H, --hostname | hostname  | String | links pointing to this hostname should always work | none           |
| -u, --urls | urls  | String[] | list of external urls on which to find hostname links | []           |
| -C, --config-file | configFile  | String | Path to your config file  | ./.externallinkchecksrc           |
| -o, --online | online  | Boolean | Will check in online documentation if provided | not provided  |
| -s, --sitedata | siteData  | String | Path to the generated siteData.js file of vuepress used in local mode (--online not provided) | will check in multiple places  |

## Test
```
mocha
```

## TODO:

- number of dead links
- linter
- publish on NPM
- testing in vuepress env
- add multilanguage links (/en/, /fr/)
- add a hash checker on online version
- stop process if a dead link was found

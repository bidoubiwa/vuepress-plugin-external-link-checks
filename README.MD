# vuepress-external-link-check

Given a list of external links, this package will test if all the links found in those external pages that match the vuepress website's hostname are still alive.

You can run the test against your local vuepress routing using the (soon to come) vuepress plugin, or you can run the test against your online vuepress.

## Install

```bash
yarn add vuepress-external-link-check
```

## try out

```bash
npx vuepress-external-link-check -t test/vuepress -H docs.meilisearch.com -u 'https://github.com/meilisearch/meilisearch-python/blob/master/README.md,https://github.com/meilisearch/meilisearch-go/blob/master/readme.md,https://github.com/meilisearch/meilisearch/blob/master/README.md'
```

## TODO:

- linter
- publish on NPM
- testing in vuepress env
- add multilanguage links (/en/, /fr/)
- add a hash checker on online version
- stop process if a dead link was found

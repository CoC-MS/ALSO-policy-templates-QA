# ALSO Microsoft Security Policy Templates Navigator

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/

## Local development

```shell
npm install
npm run sync:metadata
npm run dev
```

Run `npm test` for the catalog and repository-topic tests, and `npm run build`
for a production build.

## Repository metadata

`npm run sync:metadata` reads the GitHub About description and Topics for every
linked repository and generates `public/repository-metadata.json`. The Pages
workflow refreshes public repository metadata on every deployment and once per
day. When its token cannot read an internal repository, the last synchronized
metadata is retained. Overview search uses only these repository topics.

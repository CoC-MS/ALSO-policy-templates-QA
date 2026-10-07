# ALSO Microsoft Security Policy Templates Navigator

An interactive guide that combines a customer's Microsoft 365 licenses to identify every ALSO security policy template repository that meets their prerequisites.

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/

## Local development

```shell
npm install
npm run index:repositories
npm run dev
```

Run `npm test` for the catalog and repository-search tests, and `npm run build`
for a production build.

## Repository search index

`npm run index:repositories` shallow-clones every publicly accessible linked
policy-template repository and generates `public/repository-index.json` from
its current text files. Internal repositories are deliberately excluded from
the public index. The Pages workflow refreshes the index on every deployment
and once per day, so browser searches return direct links to matching files
without exposing a GitHub token or requiring a backend.

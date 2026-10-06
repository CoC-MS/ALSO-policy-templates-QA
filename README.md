# ALSO Policy Templates Guide

An interactive guide that helps Microsoft 365 customers find the correct ALSO security policy template repository for their license and platform.

**Live site:** https://coc-ms.github.io/ALSO-security-policy-templates-navigator/

## Local development

Prerequisites: Node.js 20 or later.

```sh
npm install
npm run dev
```

Vite prints the local preview URL in the terminal.

## Quality checks

```sh
npm test
npm run build
```

`npm test` runs the focused license eligibility and platform routing tests. `npm run build` type-checks the application and creates the static site in `dist/`.

## Deployment

Pushes to `main` trigger [the GitHub Pages workflow](.github/workflows/deploy-pages.yml). It builds the application with the project Pages base path and deploys the generated artifact using GitHub's official Pages actions.

The guide has no backend, analytics, telemetry, or browser storage.

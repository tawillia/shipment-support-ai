# Netlify deployment readiness

Checked November 11, 2026. No site was created, linked, uploaded, or deployed.

## Readiness

The static application build and Netlify configuration are prepared. All 64 local tests pass. Full release sign-off remains pending because the Storybook browser suite could not start in this sandbox. P2's owner-review and deployment-approval requirements still apply.

## Configuration

Use the project folder containing `package.json` and `netlify.toml` as the repository/base directory. If connecting a larger repository, select this project's subdirectory as the Netlify base directory and keep the build/publish paths relative to it.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node.js | Major version 24, set in `netlify.toml` |
| Local verification runtime | Node 24.22.0; npm 11.19.1 |
| Application environment variables | None required for this deterministic MVP |
| SPA rewrite | `/*` → `/index.html`, HTTP 200, not forced |

`netlify.toml` configures Git-based builds. `public/_redirects` is copied by Vite into `dist/_redirects`, preserving the same fallback for manual uploads. The rules are deliberately identical. Existing files take priority; the fallback does not force JavaScript or CSS requests to HTML.

The application currently uses in-page UI state rather than URL-based routes; the fallback also supports future client-side paths. See Netlify's [file-based configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/) and [JavaScript SPA guidance](https://docs.netlify.com/build/configure-builds/javascript-spas/).

## Verification performed

| Check | Outcome |
| --- | --- |
| `npm run build` | Pass; TypeScript check and Vite production build complete |
| `npm test` | Pass: 64 tests across five files |
| `npm run build-storybook` | Pass; separate `storybook-static/` output |
| `npm run test:stories` | Blocked before tests: sandbox denied local server `listen` on IPv6 loopback (`EPERM`) |
| Built entry point | `dist/index.html` exists |
| Built assets | Every `/assets/...` reference in the built HTML resolves to a built JS/CSS file |
| SPA configuration | Checked build settings and both matching fallback rules |
| Production source maps | None generated |
| Secret scan | No suspected secrets detected in project source/config/docs and app production output |

The production output is four files: `index.html`, `_redirects`, and the hashed JS/CSS assets. Source code, tests, docs, node_modules, and Storybook are not included in the application upload ZIP.

The Storybook browser suite must be rerun from an ordinary local terminal that can start the test server and Chromium:

```sh
npx playwright install chromium
npm run test:stories
```

This attempt did not execute browser tests and must not be counted as a passing suite. Earlier supported-browser checks are documented in validation.md; they do not replace a fresh complete browser-suite run. No fresh full-browser rendering audit or Netlify-hosted test was performed in this deployment-preparation pass.

## Secret-scan scope and limits

Inspected local project source, configuration, documentation, and all files in `dist`. Checked common API-token formats, private-key markers, long quoted credential assignments, sensitive environment/credential filenames, and browser environment-variable references. No matches were found. No live API calls, required API keys, or environment-variable references were found in application code. `.env*` and `.netlify/` are ignored to keep future local secrets/configuration out of version control.

The scan excludes third-party dependencies and generated Storybook tooling. There is no Git repository/history in this checkout, so commit history could not be checked. Netlify account/build-environment settings were not accessed. Pattern scanning cannot prove the absence of every possible secret; this is a local-source and built-artifact check, not a security certification. The machine-readable evidence records file counts and production SHA-256 hashes without printing credential values.

## Prepared artifacts

- `shipment-support-ai-netlify.zip` in the parent outputs folder: refreshed production upload, with `index.html` and `_redirects` at archive root.
- `shipment-support-ai-source.zip`: refreshed source, lockfile, docs, and Netlify configuration; excludes dependencies and generated outputs.
- `docs/deployment-evidence.json`: scan results and production file hashes.

When deployment is approved, upload the entire extracted production folder or connect the source project with the settings above. Open the hosted HTTPS URL to test the deployed application. A `file://` URL is not a valid way to verify this production build.

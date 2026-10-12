# Luce landing page

Live site: https://federicopoi.github.io/luce/

Static landing page with interactive Luce desktop and phone demos. The demos use fictional sample data and run entirely in the browser.

## Local preview

From the parent directory, run `python3 -m http.server 8767` and open http://localhost:8767/luce/.

## Publishing

GitHub Pages publishes the repository root from the `main` branch. Push changes to `main` to update the site. Asset URLs use the `/luce/` project path. `.nojekyll` keeps the site as plain static files.

The embedded application components retain their license in `native/LICENSE`.

## Mac download

The landing links to the `v0.1.0-beta.1` unnotarized Apple Silicon release in this public `federicopoi/luce` repository. It requires macOS 13+, separately installed provider CLIs, and Open Anyway on first launch. Download clicks retain the native browser transfer and bring the responsive illustrated guide into view. The guide remains visible without JavaScript.

Run `python3 scripts/verify-download.py` with Playwright for Python and Chromium installed to check the local download flow. `--url https://federicopoi.github.io/luce/` checks the published page. The test stubs only the binary response; actual release delivery and SHA-256 are verified separately before publishing.

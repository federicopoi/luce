# Luce landing page

Live site: https://federicopoi.github.io/luce/

Static landing page with interactive Luce desktop and phone demos. The demos use fictional sample data and run entirely in the browser.

## Local preview

From the parent directory, run `python3 -m http.server 8767` and open http://localhost:8767/luce/.

## Publishing

GitHub Pages publishes the repository root from the `main` branch. Push changes to `main` to update the site. Asset URLs use the `/luce/` project path. `.nojekyll` keeps the site as plain static files.

The embedded application components retain their license in `native/LICENSE`.

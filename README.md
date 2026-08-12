# Wave

Wave is a client-side wallpaper generator for creating colorful, layered sinusoidal designs. Customize the palette, wave geometry, seed, and canvas size, then share the design by URL or download it as a PNG.

Built with React, TypeScript, Vite, and Tailwind CSS. Designs are rendered locally in the browser.

## Development

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

## Checks

```sh
npm test
npm run build
```

To inspect the production build locally, run `npm run preview` after building.

## GitHub Pages

The production build uses `/waves/` as its base path and is deployed by the
GitHub Actions workflow in `.github/workflows/deploy-pages.yml`.

In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
Pushes to `main` then build and publish the site automatically. The deployed
site is available at <https://sbharga.github.io/waves/>.

## Shortcuts

- `N` — generate a new seed
- `D` — download a PNG
- `L` — copy a shareable design link
- `H` — hide or show the controls

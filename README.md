# Offlister

Local-first to-do and shopping list PWA for one phone. All data stays in the browser's `localStorage`.

```
npm install
npm run dev        # local dev server
npm run typecheck
npm test           # Vitest, pure logic in src/lib and src/store
npm run build
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`: tests, build, publish to GitHub Pages at
`https://dmkb-7005.github.io/offlister/`. One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

Install on the phone from Chrome (⋮ → Add to Home screen / Install app). New versions show an
**Update available** dialog; nothing updates silently. Changing the icon or theme colour needs a
reinstall, which deletes the app's data.

# Anomalies — Whitelist App

## Run it in VS Code

1. Open this folder in VS Code (`File → Open Folder…`).
2. Open a terminal (`` Ctrl+` ``) and run:
   ```
   npm install
   npm run dev
   ```
3. Open the URL it prints (usually `http://localhost:5173`).

That's it — hot reload is on, so any file you save updates the browser instantly.

## Project layout

```
src/
  App.jsx         All four pages (Landing, Apply, Checker, Gallery) + shared UI bits
  storage.js       The "backend" — swap this for a real API when you're ready
  assets/          Every image the app uses
  main.jsx         React entry point
index.html         Loads the Baloo 2 / Nunito fonts
```

## Changing images

Every image is a normal file in `src/assets/`, imported at the top of `App.jsx`:

```js
import avatar0 from "./assets/avatar_0.webp";
...
import landingBg from "./assets/landing_bg.webp";
```

To replace one: just overwrite the file in `src/assets/` with the same
filename (or add a new file and update the `import` line + the `AVATARS`
array to point at it). PNG/JPG/WEBP/SVG all work — Vite handles the
conversion automatically, no base64 needed.

To add more gallery avatars permanently (not just via the in-app "add by
URL" box), drop new files in `src/assets/`, import them, and add them to
the `AVATARS` array near the top of `App.jsx`.

## About the "backend"

`src/storage.js` is the one file every page talks to for saving/reading
whitelist applications and gallery items. Locally it uses the browser's
`localStorage` (data stays on your machine only). When you're ready to
launch for real, that's the only file you need to rewrite — point its four
functions at your actual API/database instead.

## Building for production

```
npm run build
```
Outputs a static site to `dist/` you can deploy anywhere (Vercel, Netlify,
Cloudflare Pages, your own server, etc).

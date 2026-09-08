# madyan-chowdhury.github.io — Portfolio

Zero-build static portfolio site. No frameworks, no build step — just open `index.html`.

## Structure

```
index.html   — the whole site (semantic HTML, SEO/OG meta, JSON-LD Person schema)
style.css    — design system + the "exploded" kinetic layer (all decorative effects
               self-disable under prefers-reduced-motion / no-JS)
main.js      — lightbox, scroll-reveal, footer year (vanilla JS, progressive enhancement)
effects.js   — exploded flourish: custom cursor, magnetic buttons, canvas particle
               field, 3D tilt, glitch headers, count-up, parallax. Decorative only;
               bails out entirely on prefers-reduced-motion & touch.
grit-*.jpg   — GRIT Mars rover photos (NASA NCAS, 1st place)
coffee-*.jpg — Automated iced coffee machine (Summer 2026 internship).
               Sources live in the vault at "Ice Coffee/"; these are rotated
               upright and downscaled to 1600px long edge for web.
hand-*.jpg   — SECME robotic hand photos (2nd place)
_backup_original/ — the previous version of the site (not deployed-critical; can be excluded)
```

## TODOs before/after deploy

1. **Resume:** drop `resume.pdf` into this folder, then in `index.html` remove
   `class="... is-disabled"` and `aria-disabled="true"` from the Resume button in the hero.
2. **URLs:** after deploying, search `index.html` for `madyan-chowdhury.github.io` and
   replace with your real live URL (canonical link, `og:url`, `og:image`,
   `twitter:image`, and the JSON-LD `url`). `og:image` must stay an absolute URL.

## Deploy to GitHub Pages

1. Create a repo (either `Madyan-Chowdhury.github.io` for a root site, or any name for
   a `/repo-name/` site).
2. From this folder:
   ```sh
   git init
   git add index.html style.css main.js effects.js README.md grit-*.jpg hand-*.jpg coffee-*.jpg
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/Madyan-Chowdhury/REPO-NAME.git
   git push -u origin main
   ```
3. On GitHub: Settings → Pages → Source: "Deploy from a branch" → `main` / `/ (root)` → Save.
4. Site goes live at `https://madyan-chowdhury.github.io/REPO-NAME/` in a minute or two.
   Then do TODO #2 above and push again.

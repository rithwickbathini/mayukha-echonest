# Mayukha EchoNest — Website

**Live at: https://rithwickbathini.github.io/mayukha-echonest/**

Hosted free on GitHub Pages, from this repo. To publish any future edit: change
the files, then from this folder run:
```
git add -A
git commit -m "describe your change"
git push
```
The live site updates automatically within about a minute of every push.

A single-page resort website: hero, photo slideshow/gallery, spaces & experiences,
a live availability calendar, embedded map, and working WhatsApp/call/email contact.

## Files
- `index.html` — page structure & content
- `styles.css` — all design/styling
- `script.js` — slider, calendar, animations, WhatsApp links
- `assets/images/` — the 5 resort photos you shared

## Making the booking calendar live (edit availability yourself, no coding)

The calendar ships with realistic sample data so it works immediately. To make it
reflect **real** availability that you can update anytime from your phone:

1. Go to [Google Sheets](https://sheets.google.com) and create a new sheet.
2. In row 1, add headers: `Date | Status | Note`
3. From row 2 down, add one row per date, e.g.:

   | Date       | Status    | Note              |
   |------------|-----------|-------------------|
   | 2026-07-20 | available |                   |
   | 2026-07-25 | limited   | 2 slots left      |
   | 2026-08-01 | booked    |                   |

   Status must be exactly one of: `available`, `limited`, `booked` (lowercase).
   Any date not listed defaults to "available".
4. Click **Share** (top right) → change access to **"Anyone with the link" → Viewer**.
5. Copy the Sheet ID from the browser address bar:
   `https://docs.google.com/spreadsheets/d/`**`THIS_LONG_ID`**`/edit`
6. Open `script.js`, find this near the top:
   ```js
   const AVAILABILITY_CONFIG = {
     SHEET_ID: "",   // <-- paste your Sheet ID here
     ...
   ```
   Paste the ID between the quotes and save.

That's it — from then on, editing the sheet (on your phone, anytime) updates the
live website within moments. No republishing, no app, no developer needed.

## Contact details already wired up (working out of the box)
- WhatsApp: `+91 91607 00775` (floating button + hero + calendar + contact section)
- Phone: `+91 91607 00775`
- Email: `mayukharesorts@gmail.com`
- Map: Rajawaram Road, Chinnapendyala, Hanamkonda, Telangana 506144

## Adding more photos later
Drop new images into `assets/images/`, then reference them with an `<img src="assets/images/yourfile.jpg">`
tag in the gallery/slider sections of `index.html`.

## Putting this online
This is a static site — it can be hosted for free in minutes on any of:
- [Netlify Drop](https://app.netlify.com/drop) — drag the folder in, get a live link instantly
- [GitHub Pages](https://pages.github.com/)
- [Vercel](https://vercel.com/)

Once hosted, share the link — or connect your own domain (e.g. `mayukhaechonest.com`)
through the host's settings.

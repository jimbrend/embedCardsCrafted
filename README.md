# embedCraftCards

**CFO Silvia Embed Card Studio** — a single-page design surface for creating, previewing, and shipping embed cards for cfosilvia.com across 𝕏, LinkedIn, Facebook, YouTube, Discord and more.

Everything runs client-side in the browser. No build step, no backend. Open source at [github.com/jimbrend/embedCardsCrafted](https://github.com/jimbrend/embedCardsCrafted). Fork or clone freely.

## What's inside

```
cfo-silvia-studio/
├─ index.html        # markup + styles
├─ app.js            # all interactivity
├─ vercel.json       # static hosting + asset caching
├─ assets/           # the 8 source cards + the Silvia loop
└─ README.md
```

## Features

- **Inspiration reel** — eight cards drift left→right (drag to scrub). Hover any card and click **Load in editor** (overlaid, enlarges on hover).
- **Card preview + editor** — live preview stays on the left; Edit this card form is wider on the right and scrollable. Four themes (Gloss black, Gold light, White ray, Dark glow). Topical picks + "Generate new card variation" (free).
- **Platform wheel** — choose 𝕏, LinkedIn, Facebook, YouTube, Discord (or keep all on for platform-agnostic). See live chrome previews.
- **Right code sidebar** — always-visible faded peek (~right edge). Hover to smoothly swoosh it open. Contains ready-to-copy Open Graph + 𝕏 tags, iframe, oEmbed snippets plus clear guidance on setting embed cards for good social media previews.
- **Export** — HTML, Markdown, raw JSON, zip bundle, PNG render. IDE strip shows common tools (Cursor, Claude, VS Code, etc.).
- **Where it embeds** — timing + validators for 𝕏, LinkedIn, Facebook, Discord, Slack, iMessage, RCS/SMS and others.
- **Three workspace modes** (centered in top nav):
  - **Build** — full editor + preview (default creative surface).
  - **Production** — preview-focused (editor hidden) so you see the card as it will appear live.
  - **Staging** — research + tune against a live `cfosilvia.com` iframe, federal holidays list, and topical suggestions. Use this before shipping.
- **New campaign button** (bottom-left) — larger, glowing until interacted with. Click for a slow swoosh preview of the campaign tuning process, then enter Staging.
- **GitHub access** — top-left `embedCraftCards` text + GitHub logo. Hover the logo to see the repo URL and "View source · Fork or clone freely"; click to open the source.

> Many live sites (including cfosilvia.com in some configurations) block iframes via `X-Frame-Options` / CSP. The Staging view provides **Open in new tab** buttons and a dockable corner preview as fallbacks.

## Usage

1. **Start in Build mode** (default)
   - The top nav shows **embedCraftCards** on the far left (with GitHub logo).
   - Centered buttons: **Build** | **Production** | **Staging**.
   - Scroll or drag the inspiration reel at the top. Hover a card → click the overlaid **Load in editor** button (cards enlarge on hover).
   - Edit text, proof points, CTA, brand line, or pick a topical preset on the right. Switch themes instantly. The card preview stays pinned on the left.
   - Use the platform wheel to add/remove 𝕏 / LinkedIn / etc. chrome.
   - Hover the right edge to expand the **Code snippets** sidebar. It shows current Open Graph + Twitter Card tags, iframe embed, and oEmbed with one-click copy. The note at the top explains exactly how to set these up for reliable social previews.
   - Export in any format at the bottom (including a self-contained zip).

2. **Production mode**
   - Click the **Production** button in the center nav.
   - The editor panel disappears so you see a larger, clean card preview — exactly how it will look when embedded.
   - Switch back to **Build** anytime to continue editing.

3. **Staging + "New campaign" flow**
   - Click **Staging** (big glowing button) or the **Generate** / "new campaign" button at bottom-left.
   - The bottom-left button does a deliberate slow swoosh + shows a preview card: "Click to preview the campaign process".
   - In Staging you get:
     - Live `cfosilvia.com` in an iframe (with open-tab + dock-to-corner fallbacks).
     - 2026 federal holidays you can tap to theme the card.
     - Auto-generated topical suggestions.
   - Changes you make in Build carry over. Use Staging to research what is currently live, then refine the daily/seasonal/holiday layer before shipping.

4. **Keyboard**
   - `B` → Build
   - `P` → Production
   - `S` → Staging
   - (Typing in inputs is ignored so you don't accidentally switch.)

5. **GitHub**
   - Hover the GitHub logo next to `embedCraftCards` in the top-left. It pops the full repo URL and the message "View source · Fork or clone freely". Click to visit the repository.

The entire experience is designed so the card preview is always visible on the left while you work, the code you need is one hover away on the right, and moving between creative work (Build), clean review (Production), and live research (Staging) is instant via the centered top buttons.

## Run locally

```bash
# any static server works
npx serve .
# or
python3 -m http.server 8080
```

## Deploy

### GitHub → Vercel
1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo.
3. Framework preset: **Other** (it's static). Leave build & output empty.
4. Deploy. `vercel.json` handles clean URLs and asset caching.

### Vercel CLI
```bash
npm i -g vercel
vercel
```

## Notes

This is a design surface for making cards. It is not affiliated with X or Anthropic;
the faded gold/clay wash is a visual nod only. Real 𝕏 authentication and Grok Imagine
generation happen on those platforms — the studio links out to them rather than
proxying credentials.

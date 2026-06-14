/* embedCardsCrafted — CFO Silvia Studio reference example (client-side only) */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  /* ---------- whoosh (Web Audio, no asset) ---------- */
  let actx;
  function whoosh(dir = 1) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const dur = 0.5, sr = actx.sampleRate;
      const buf = actx.createBuffer(1, sr * dur, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.5);
      const src = actx.createBufferSource(); src.buffer = buf;
      const bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.8;
      const t = actx.currentTime;
      bp.frequency.setValueAtTime(dir > 0 ? 380 : 2600, t);
      bp.frequency.exponentialRampToValueAtTime(dir > 0 ? 2600 : 380, t + dur);
      const g = actx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp).connect(g).connect(actx.destination);
      src.start();
    } catch (e) {}
  }

  /* ---------- inspiration reel ---------- */
  const reelData = [
    ["assets/card-01.jpg", "Light · pill CTA"],
    ["assets/card-02.jpg", "Gold display"],
    ["assets/card-03.jpg", "Gloss square"],
    ["assets/card-04.jpg", "White · CFO line"],
    ["assets/card-05.jpg", "Light ray · 𝕏"],
    ["assets/card-06.jpg", "Dark glow · 𝕏"],
    ["assets/card-07.jpg", "Gold gradient · 𝕏"],
    ["assets/card-08.jpg", "Mono fade · 𝕏"],
  ];
  const reelTheme = ["goldlight","goldlight","gloss","whiteray","whiteray","darkglow","goldlight","gloss"];
  const reel = $("#reel");
  const reelSet = [...reelData, ...reelData];
  reelSet.forEach(([src, tag], i) => {
    const el = document.createElement("button");
    el.className = "reel-card";
    el.innerHTML = `<span class="tag">${tag}</span><img loading="lazy" src="${src}" alt="${tag} card"><span class="use">Load in editor</span>`;
    el.addEventListener("click", () => { if (!didDrag) loadReel(i % reelData.length); });

    const dl = document.createElement("button");
    dl.className = "reel-dl";
    dl.title = "Download this card image";
    dl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
    dl.addEventListener("click", (e) => {
      e.stopPropagation();
      const a = document.createElement("a");
      a.href = src;
      a.download = `embed-craft-card-${String((i % reelData.length) + 1).padStart(2, "0")}.jpg`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    });
    el.appendChild(dl);
    reel.appendChild(el);
  });

  let drift = 0, dragging = false, startX = 0, startDrift = 0, paused = false;
  let didDrag = false; // track if pointer moved so click-after-drag is suppressed
  const SPEED = 0.28;

  const reelScrub = $("#reelScrub");
  const reelScrubThumb = $("#reelScrubThumb");

  function reelHalf() { return reel.scrollWidth / 2 || 1; }

  function updateScrubThumb() {
    if (!reelScrub || !reelScrubThumb) return;
    const half = reelHalf();
    const pct = Math.max(0, Math.min(1, -drift / half));
    const trackW = reelScrub.offsetWidth;
    const thumbW = reelScrubThumb.offsetWidth;
    reelScrubThumb.style.left = (pct * (trackW - thumbW)) + "px";
    reelScrubThumb.style.marginLeft = "0";
  }

  function tick() {
    if (!dragging && !paused) {
      drift -= SPEED;
      const half = reelHalf();
      if (-drift >= half) drift += half;
      if (drift > 0) drift -= half;
      reel.style.transform = `translateX(${drift}px)`;
    }
    updateScrubThumb();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Reel card drag (pointer on cards)
  reel.addEventListener("pointerdown", (e) => {
    dragging = true; didDrag = false;
    reel.classList.add("dragging");
    startX = e.clientX; startDrift = drift;
    reel.setPointerCapture(e.pointerId);
  });
  reel.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    if (Math.abs(e.clientX - startX) > 4) didDrag = true;
    drift = startDrift + (e.clientX - startX);
    reel.style.transform = `translateX(${drift}px)`;
  });
  reel.addEventListener("pointerup", () => { dragging = false; reel.classList.remove("dragging"); });
  reel.addEventListener("mouseenter", () => paused = true);
  reel.addEventListener("mouseleave", () => paused = false);

  // Scrub bar drag
  if (reelScrub) {
    let scrubDragging = false, scrubStartX = 0, scrubStartDrift = 0;
    reelScrub.addEventListener("pointerdown", (e) => {
      scrubDragging = true;
      reelScrub.classList.add("grabbing");
      scrubStartX = e.clientX; scrubStartDrift = drift;
      paused = true;
      reelScrub.setPointerCapture(e.pointerId);
    });
    reelScrub.addEventListener("pointermove", (e) => {
      if (!scrubDragging) return;
      const trackW = reelScrub.offsetWidth;
      const thumbW = reelScrubThumb ? reelScrubThumb.offsetWidth : 48;
      const usable = trackW - thumbW;
      const half = reelHalf();
      const dx = e.clientX - scrubStartX;
      drift = scrubStartDrift - (dx / usable) * half;
      reel.style.transform = `translateX(${drift}px)`;
    });
    reelScrub.addEventListener("pointerup", () => {
      scrubDragging = false;
      reelScrub.classList.remove("grabbing");
      paused = false;
    });
    reelScrub.addEventListener("pointercancel", () => {
      scrubDragging = false;
      reelScrub.classList.remove("grabbing");
      paused = false;
    });
  }

  function loadReel(i) {
    setTheme(reelTheme[i]);
    toast("Loaded card " + String(i + 1).padStart(2, "0") + " into the editor ↓");
    // Ensure we're on the main build view before scrolling
    setMode("build");
    const previewPanel = $(".preview-panel");
    if (previewPanel) {
      previewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      const embedEl = $("#embed");
      if (embedEl) {
        embedEl.style.transition = "box-shadow .15s, outline .15s";
        embedEl.style.outline = "2.5px solid rgba(231,178,60,.8)";
        embedEl.style.boxShadow = "0 0 0 8px rgba(231,178,60,.18), 0 30px 90px -30px #000";
        setTimeout(() => {
          embedEl.style.outline = "";
          embedEl.style.boxShadow = "";
        }, 1100);
      }
    }
  }

  /* ---------- editable card ---------- */
  const card = {
    eyebrow: $("#cEyebrow"), title: $("#cTitle"), sub: $("#cSub"), body: $("#cBody"),
    cta: $("#cCta"), brand: $("#cBrand"), stats: $$("#cStats span"),
  };
  const ins = { eyebrow: $("#iEyebrow"), title: $("#iTitle"), sub: $("#iSub"), body: $("#iBody"), cta: $("#iCta"), brand: $("#iBrand"), s1: $("#iS1"), s2: $("#iS2"), s3: $("#iS3"), imageBase: $("#iImageBase") };
  function emph(s) { return s.replace(/\*(.+?)\*/g, "<em>$1</em>"); }
  function sync() {
    card.eyebrow.textContent = ins.eyebrow.value;
    card.title.textContent = ins.title.value;
    card.sub.innerHTML = emph(ins.sub.value);
    card.body.textContent = ins.body.value;
    card.cta.textContent = ins.cta.value;
    card.brand.textContent = ins.brand.value;
    [ins.s1, ins.s2, ins.s3].forEach((inp, k) => {
      const sp = card.stats[k]; const svg = sp.querySelector("svg");
      sp.textContent = ""; sp.appendChild(svg.cloneNode(true)); sp.appendChild(document.createTextNode(inp.value));
    });
  }
  Object.values(ins).forEach((inp) => inp.addEventListener("input", sync));
  if (ins.imageBase) ins.imageBase.addEventListener("input", buildSidebarSnippets);
  sync();

  /* ---------- theme ---------- */
  const embed = $("#embed");
  function setTheme(name) {
    embed.dataset.theme = name;
    $$("#themeSeg button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.theme === name));
  }
  $$("#themeSeg button").forEach((b) => b.addEventListener("click", () => setTheme(b.dataset.theme)));

  /* ---------- topical picks ---------- */
  const presets = {
    daily: { eyebrow: "Markets, decoded daily.", sub: "Your *daily* read, before the open.", body: "Silvia turns the morning tape into one clear move. Institutional-grade analysis — in real time, around the clock.", cta: "Read today's brief" },
    seasonal: { eyebrow: "Position for the season ahead.", sub: "Build *generational* wealth, season by season.", body: "Rebalance, harvest, and plan with an AI CFO that watches the calendar so you don't have to.", cta: "Plan the quarter" },
    holiday: { eyebrow: "Markets closed. Silvia isn't.", sub: "A *holiday* worth its weight in gold.", body: "While the desks are dark, Silvia keeps tracking your net worth and lines up tomorrow's open.", cta: "Check your position" },
    rates: { eyebrow: "Rate decision, in plain English.", sub: "What the *cut* means for your money.", body: "Silvia reads the dot plot so you read the impact — on your portfolio, in one card.", cta: "See the impact" },
    earnings: { eyebrow: "Earnings week, handled.", sub: "Beat or *miss*, you'll know first.", body: "Silvia watches every print that touches your book and flags what actually moves you.", cta: "Track earnings" },
  };
  const defaults = { eyebrow: ins.eyebrow.value, sub: ins.sub.value, body: ins.body.value, cta: ins.cta.value };
  $$("#picks .pick").forEach((p) => p.addEventListener("click", () => {
    const k = p.dataset.pick;
    const set = k === "reset" ? defaults : presets[k];
    if (!set) return;
    ins.eyebrow.value = set.eyebrow; ins.sub.value = set.sub; ins.body.value = set.body; ins.cta.value = set.cta;
    sync();
    toast(k === "reset" ? "Reset to default copy" : "Topical copy applied · " + k);
  }));

  $("#regenBtn").addEventListener("click", () => {
    const order = ["gloss", "goldlight", "whiteray", "darkglow"];
    const cur = order.indexOf(embed.dataset.theme);
    setTheme(order[(cur + 1) % order.length]);
    whoosh(1);
    toast("New variation · " + embed.dataset.theme + " theme");
  });

  /* Grok prompt + custom background upload */
  const grokPromptBtn = $("#grokPromptBtn");
  const bgUpload = $("#bgUpload");
  function buildGrokPrompt() {
    const d = cardData();
    const themeName = embed.dataset.theme || "gloss";
    const styleNotes = {
      gloss: "glossy deep black luxury with soft gold metallic reflections, elegant dark premium finance aesthetic, subtle cinematic highlights",
      goldlight: "warm elegant gold and cream luxury, light rays and soft highlights, sophisticated bright premium feel",
      whiteray: "clean bright white with golden accents and soft light rays, modern airy high-end minimal",
      darkglow: "rich dark with warm golden glow and soft bloom, dramatic elegant wealth visualization"
    };
    const style = styleNotes[themeName] || styleNotes.gloss;
    return `Create a high-end, professional social media embed / Open Graph card background image (no text in the image — text will be overlaid cleanly in HTML later).

Theme / style direction: ${style}. Premium, trustworthy, modern finance / AI wealth tool aesthetic for "CFO Silvia".

Key mood: serious investors, generational wealth, institutional quality, calm confidence, subtle abstract market or net-worth visualization (soft geometric lines, faint elegant charts, or luxurious textures — do not make it busy).

The image must leave clean negative space / good contrast areas for the following overlay text (do not render any text yourself):
- Eyebrow (small, upper): ${d.eyebrow}
- Large title: ${d.title}
- Subhead: ${d.sub}
- Body paragraph
- CTA button
- Bottom brand footer

Recommended output: crisp 1200x630 or similar card proportions, ultra sharp, excellent for Twitter/X large summary cards, LinkedIn, Facebook, Discord. Photorealistic details mixed with elegant digital illustration. Rich color grading, high production value, no low-quality artifacts.`;
  }
  if (grokPromptBtn) {
    grokPromptBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(buildGrokPrompt()).then(() => {
        toast("Grok prompt copied — paste into Grok to generate a custom background image");
      });
    });
  }
  if (bgUpload) {
    bgUpload.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      embed.style.setProperty("--art", `url(${URL.createObjectURL(file)})`);
      toast("Custom background loaded. Live preview + PNG export now use your image.");
    });
  }

  /* ========== IDEA PROMPT DRIVER ========== */
  const ideaPrompt = document.getElementById("ideaPrompt");
  const intentPill = document.getElementById("intentPill");
  const ideaRecs = document.getElementById("ideaRecs");
  const platformScroller = document.getElementById("platformScroller");
  const platformTrack = document.getElementById("platformTrack");

  function updateIntentPill(fullText) {
    if (!intentPill) return;
    const words = fullText.trim().split(/\s+/).filter(w => w.length > 1);
    const first = words[0];
    if (!first) { intentPill.style.display = "none"; intentPill.classList.remove("evaporating"); return; }
    intentPill.innerHTML = `<span class="word">${first}</span><span class="close">×</span>`;
    intentPill.style.display = "inline-flex";
    intentPill.onclick = (ev) => {
      if (ev.target.classList.contains("close")) {
        intentPill.classList.add("evaporating");
        setTimeout(() => {
          intentPill.classList.remove("evaporating");
          intentPill.style.display = "none";
          const remaining = words.slice(1).join(" ");
          if (ideaPrompt) { ideaPrompt.value = remaining; parseAndApplyIdea(remaining); }
        }, 260);
      }
    };
  }

  function animatePlatformWheel(text) {
    if (!platformScroller || !platformTrack) return;
    const lower = text.toLowerCase();
    platformScroller.classList.add("reacting");
    platformTrack.querySelectorAll(".p").forEach(el => el.classList.remove("active"));
    const highlights = [];
    if (lower.includes("x") || lower.includes("twitter") || lower.includes("social") || lower.includes("post")) highlights.push("𝕏");
    if (lower.includes("linkedin") || lower.includes("professional") || lower.includes("investor") || lower.includes("b2b")) highlights.push("LinkedIn");
    if (lower.includes("facebook") || lower.includes("meta")) highlights.push("Facebook");
    if (lower.includes("youtube") || lower.includes("video") || lower.includes("watch")) highlights.push("YouTube");
    if (lower.includes("discord") || lower.includes("community") || lower.includes("chat")) highlights.push("Discord");
    platformTrack.querySelectorAll(".p").forEach(el => { if (highlights.includes(el.textContent)) el.classList.add("active"); });
    platformTrack.style.animationDuration = "3.2s";
    clearTimeout(animatePlatformWheel._t);
    animatePlatformWheel._t = setTimeout(() => {
      if (platformTrack) platformTrack.style.animationDuration = "18s";
      if (platformScroller) platformScroller.classList.remove("reacting");
    }, 2200);
  }

  function parseAndApplyIdea(text) {
    if (!text || text.length < 2) return;
    const lower = text.toLowerCase().trim();
    updateIntentPill(text);
    animatePlatformWheel(text);
    let matched = false;
    if (lower.includes("patrick") || lower.includes("st. patrick") || lower.includes("irish") || lower.includes("lucky") || lower.includes("green")) {
      ins.eyebrow.value = "Markets closed for St. Patrick's Day."; ins.sub.value = "A *lucky* day to check your position.";
      ins.body.value = "Markets may be quiet, but Silvia keeps tracking your net worth and lines up tomorrow's open."; ins.cta.value = "Check your position";
      setTheme("goldlight"); matched = true;
    } else if (lower.includes("earnings") || lower.includes("beat") || lower.includes("miss") || lower.includes("report")) {
      ins.eyebrow.value = "Earnings week, handled."; ins.sub.value = "Beat or *miss*, you'll know first.";
      ins.body.value = "Silvia watches every print that touches your book and flags what actually moves you."; ins.cta.value = "Track earnings";
      setTheme("darkglow"); matched = true;
    } else if (lower.includes("rate") || lower.includes("fed") || lower.includes("fomc") || lower.includes("cut") || lower.includes("decision")) {
      ins.eyebrow.value = "Rate decision, in plain English."; ins.sub.value = "What the *cut* means for your money.";
      ins.body.value = "Silvia reads the dot plot so you read the impact — on your portfolio, in one card."; ins.cta.value = "See the impact";
      setTheme("gloss"); matched = true;
    } else if (lower.includes("holiday") || lower.includes("federal") || lower.includes("closed") || lower.includes("markets closed")) {
      ins.eyebrow.value = "Markets closed. Silvia isn't."; ins.sub.value = "A *holiday* worth its weight in gold.";
      ins.body.value = "While the desks are dark, Silvia keeps tracking your net worth and lines up tomorrow's open."; ins.cta.value = "Check your position";
      setTheme("whiteray"); matched = true;
    } else if (lower.includes("swing") || lower.includes("volatile") || lower.includes("moving") || lower.includes("market move") || lower.includes("rally") || lower.includes("drop")) {
      ins.eyebrow.value = "Markets are moving fast."; ins.sub.value = "Silvia sees every *swing*.";
      ins.body.value = "Volatility creates opportunity. Get institutional-grade analysis the moment it matters."; ins.cta.value = "See the moves";
      setTheme("darkglow"); matched = true;
    } else if (lower.includes("q2") || lower.includes("quarter") || lower.includes("rebalance") || lower.includes("seasonal")) {
      ins.eyebrow.value = "Position for the season ahead."; ins.sub.value = "Build *generational* wealth, season by season.";
      ins.body.value = "Rebalance, harvest, and plan with an AI CFO that watches the calendar so you don't have to."; ins.cta.value = "Plan the quarter";
      setTheme("goldlight"); matched = true;
    } else if (lower.includes("summer") || lower.includes("outlook") || lower.includes("season")) {
      ins.eyebrow.value = "Summer markets decoded."; ins.sub.value = "Stay sharp while the rest of the world slows down.";
      ins.body.value = "Silvia keeps the same institutional rigor even when volumes thin out."; ins.cta.value = "Stay ahead this summer";
      setTheme("gloss"); matched = true;
    }
    if (!matched && text.length > 6) {
      ins.eyebrow.value = text.length > 38 ? text.slice(0, 35) + "..." : text;
      ins.sub.value = "Silvia has your back.";
      ins.body.value = text + ". Get clear, institutional-grade insight in real time.";
      ins.cta.value = "See it now";
    }
    sync();
  }

  if (ideaPrompt) {
    let typingTimer;
    ideaPrompt.addEventListener("input", () => {
      clearTimeout(typingTimer);
      if (platformTrack) platformTrack.style.animationDuration = "4.5s";
      typingTimer = setTimeout(() => parseAndApplyIdea(ideaPrompt.value), 180);
    });
    ideaPrompt.addEventListener("focus", () => {
      if (platformScroller) platformScroller.classList.add("reacting");
      if (platformTrack) platformTrack.style.animationDuration = "5.5s";
    });
    ideaPrompt.addEventListener("blur", () => {
      if (platformTrack) platformTrack.style.animationDuration = "18s";
      if (platformScroller) platformScroller.classList.remove("reacting");
    });
  }
  if (ideaRecs) {
    ideaRecs.querySelectorAll(".rec").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idea = btn.dataset.idea;
        if (!ideaPrompt) return;
        ideaPrompt.value = idea;
        parseAndApplyIdea(idea);
        setTimeout(() => {
          const editorPanel = btn.closest(".panel");
          if (editorPanel) editorPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      });
    });
  }

  /* ---------- platform wheel + info modal ---------- */
  const platformInfoData = {
    x: {
      name: "𝕏 (Twitter/X)",
      time: "1–5 min",
      timeNote: "After Card Validator refresh",
      dims: [
        { label: "Web (desktop)", val: "1200 × 628px", sub: "2:1 landscape · summary_large_image" },
        { label: "Mobile", val: "628 × 628px", sub: "Square center-crop on some clients" }
      ],
      scenarios: [
        { label: "Organic post link", desc: "Paste URL in tweet. twitter:card=summary_large_image renders a full-width image preview above the tweet text." },
        { label: "Promoted / Paid ad", desc: "1200×628px, max 5MB, sRGB JPG or PNG. Headline + description shown below image. High contrast gets higher CTR." },
        { label: "Mobile view", desc: "Image stacks above tweet text. Some clients center-crop to square. Supply 2:1 source — safe zone in the middle." }
      ],
      meta: "twitter:card + twitter:image + twitter:title + twitter:description",
      validator: { label: "X Card Validator", url: "https://cards-dev.twitter.com/validator" }
    },
    linkedin: {
      name: "LinkedIn",
      time: "5–30 min",
      timeNote: "Post Inspector — cache is sticky, force re-scrape via tool",
      dims: [
        { label: "Web (desktop)", val: "1200 × 627px", sub: "1.91:1 ratio" },
        { label: "Mobile", val: "1200 × 627px", sub: "Scales responsively" }
      ],
      scenarios: [
        { label: "Link post preview", desc: "og:image renders as a link card below post text. og:title + domain shown below image. Works for organic posts." },
        { label: "Article cover image", desc: "1584 × 396px recommended for LinkedIn Article headers (4:1). Set separately in LinkedIn's article editor." },
        { label: "Sponsored content / ads", desc: "1200×627px, max 5MB. High-contrast text areas and faces in upper-left improve click-through rates." }
      ],
      meta: "og:image + og:title + og:description + og:url (LinkedIn reads standard OG tags)",
      validator: { label: "LinkedIn Post Inspector", url: "https://www.linkedin.com/post-inspector/" }
    },
    facebook: {
      name: "Facebook / Messenger",
      time: "Instant via Sharing Debugger",
      timeNote: "Force re-scrape at any time via Facebook Sharing Debugger",
      dims: [
        { label: "Web link card", val: "1200 × 630px", sub: "1.91:1 — triggers large preview" },
        { label: "Mobile min size", val: "560 × 292px", sub: "Below this: thumbnail only" }
      ],
      scenarios: [
        { label: "Organic link share", desc: "1200×630px triggers the large preview card in News Feed. Images under 600px wide get a small thumbnail." },
        { label: "Messenger link preview", desc: "Same OG tags pull through. Smaller card tile with title + description + domain." },
        { label: "Ad creative", desc: "1200×628px for single-image ads; 1080×1080px for square ad placements. Separate from link preview." }
      ],
      meta: "og:image + og:title + og:description + og:type + og:url",
      validator: { label: "Facebook Sharing Debugger", url: "https://developers.facebook.com/tools/debug/" }
    },
    discord: {
      name: "Discord",
      time: "~Instant",
      timeNote: "Edited images cache ~30 min on Discord's CDN",
      dims: [
        { label: "Rendered preview", val: "400 × 209px", sub: "Discord scales og:image to ~400px wide" },
        { label: "Source recommended", val: "1200 × 630px", sub: "Supply large — Discord scales down cleanly" }
      ],
      scenarios: [
        { label: "Link paste in channel", desc: "Discord auto-unfurls og:image + og:title + og:description with a left-side accent bar. No extra config needed." },
        { label: "Bot embed (programmatic)", desc: "Use Discord's Embed API for custom accent color, field layout, thumbnail, footer, and author." },
        { label: "Mobile Discord", desc: "Scales proportionally. Title + description shown below image. Dark theme — use light or high-contrast images." }
      ],
      meta: "og:image + og:title + og:description (Discord reads standard OG tags)",
      validator: { label: "Paste link in any Discord channel", url: null }
    },
    youtube: {
      name: "YouTube",
      time: "1–24 hr",
      timeNote: "Thumbnail indexing time varies by account standing",
      dims: [
        { label: "Video thumbnail", val: "1280 × 720px", sub: "16:9 · min 640×360px · max 2MB" },
        { label: "Channel art safe area", val: "1546 × 423px", sub: "Center of 2560×1440px canvas" }
      ],
      scenarios: [
        { label: "Custom video thumbnail", desc: "1280×720px JPG or PNG, max 2MB. Shown on search results, suggested videos, and browse rows. High contrast text helps." },
        { label: "Community post image", desc: "1024×1024px square recommended for community posts. Displayed at multiple sizes in feed." },
        { label: "External link og:image", desc: "When sharing a YouTube link externally, YouTube's own og:image is used — not yours. Your og:image matters on your own domain." }
      ],
      meta: "og:image used when your site links to YouTube; thumbnail is set separately in YouTube Studio",
      validator: { label: "YouTube Studio → Content", url: null }
    }
  };

  const platforms = {
    x: { name: "𝕏", meta: "reply · repost · like", chrome: xChrome, mini: "Large summary card · 2:1" },
    linkedin: { name: "LinkedIn", meta: "react · comment · repost", chrome: liChrome, mini: "Article preview · clipped title" },
    facebook: { name: "Facebook", meta: "like · comment · share", chrome: fbChrome, mini: "Link card · domain footer" },
    youtube: { name: "YouTube", meta: "watch · subscribe", chrome: ytChrome, mini: "Thumbnail + channel row" },
    discord: { name: "Discord", meta: "embed · accent bar", chrome: dcChrome, mini: "Rich embed · left accent" },
  };
  const platIcons = {
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.6h3.3l-7.2 8.2 8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.5l7.7-8.8L1 1.6h6.8l4.7 6.2zm-1.2 17.7h1.8L7.3 3.4H5.4z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.5a2 2 0 110 4 2 2 0 010-4zM3 9h3v12H3zM9 9h2.9v1.6h.04c.4-.75 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.7V21h-3v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21H9z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V7c0-.9.6-1.1 1-1.1h2V2.5h-2.7C11 2.5 10 4.4 10 6.5V9H7.5v3.4H10V21h4v-8.6h2.5L17 9z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 8.2a3 3 0 00-2.1-2.1C18 5.5 12 5.5 12 5.5s-6 0-7.9.6A3 3 0 002 8.2 31 31 0 002 12a31 31 0 00.1 3.8 3 3 0 002.1 2.1c1.9.6 7.8.6 7.8.6s6 0 7.9-.6a3 3 0 002.1-2.1A31 31 0 0022 12a31 31 0 00-.1-3.8zM10 15V9l5.2 3z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 5.3A17 17 0 0015.7 4l-.2.4a13 13 0 014 2 14 14 0 00-11 0 13 13 0 014-2l-.3-.4A17 17 0 004 5.3 18 18 0 001 18a17 17 0 005.3 2.7l.6-1a11 11 0 01-1.8-.9l.4-.3a12 12 0 0010.9 0l.5.3a11 11 0 01-1.8.9l.6 1A17 17 0 0023 18a18 18 0 00-3-12.7zM9.5 15.4c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8zm5 0c-.9 0-1.6-.8-1.6-1.8s.7-1.8 1.6-1.8 1.6.8 1.6 1.8-.7 1.8-1.6 1.8z"/></svg>',
  };
  const selected = new Set(Object.keys(platforms));
  const wheel = $("#wheel");
  Object.entries(platforms).forEach(([key, p]) => {
    const el = document.createElement("button");
    el.className = "plat"; el.dataset.plat = key; el.setAttribute("aria-pressed", "true");
    el.innerHTML = `<span class="check"><svg viewBox="0 0 24 24" width="12" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l4 4 10-11"/></svg></span>
      <span class="glyph">${platIcons[key]}</span>
      <span class="pname">${p.name}</span><span class="pmeta">${p.meta}</span>
      <span class="mini">${p.mini}</span>`;
    el.addEventListener("click", (e) => {
      if (e.target.closest(".check") || e.defaultPrevented) return;
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        togglePlat(key, el);
      } else {
        openPlatModal(key);
      }
    });
    wheel.appendChild(el);
  });

  function togglePlat(key, el) {
    if (selected.has(key)) selected.delete(key); else selected.add(key);
    el.setAttribute("aria-pressed", selected.has(key));
    refreshChrome();
  }
  const agnosticBtn = $("#agnostic");
  agnosticBtn.addEventListener("click", () => {
    const on = agnosticBtn.getAttribute("aria-pressed") !== "true";
    agnosticBtn.setAttribute("aria-pressed", on);
    if (on) { Object.keys(platforms).forEach((k) => selected.add(k)); }
    $$(".plat").forEach((el) => el.setAttribute("aria-pressed", selected.has(el.dataset.plat) ? "true" : agnosticBtn.getAttribute("aria-pressed")));
    refreshChrome();
  });

  function metrics() { return { reply: 10, repost: 10, like: 27, views: "16K" }; }
  function ic(name) { const I = { reply: '<path d="M21 11.5a8.5 8.5 0 01-12 7.7L3 21l1.8-6A8.5 8.5 0 1121 11.5z"/>', repost: '<path d="M7 7h10l-2-2M17 17H7l2 2M17 7v6M7 17v-6"/>', like: '<path d="M12 21s-7-4.5-9-9a4.5 4.5 0 019-1 4.5 4.5 0 019 1c-2 4.5-9 9-9 9z"/>', views: '<path d="M4 19V9M9 19V5M14 19v-7M19 19v-11"/>', sub: '<path d="M5 12h14M12 5v14"/>' }; return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${I[name]}</svg>`; }
  function xChrome() { const m = metrics(); return `<span class="m">${ic("reply")}${m.reply}</span><span class="m">${ic("repost")}${m.repost}</span><span class="m">${ic("like")}${m.like}</span><span class="m">${ic("views")}${m.views}</span><span class="spacer"></span><span class="m">↗</span>`; }
  function liChrome() { return `<span class="m">${ic("like")} 142</span><span class="m">${ic("reply")} 18</span><span class="m">${ic("repost")} Repost</span><span class="spacer"></span><span class="m">Send</span>`; }
  function fbChrome() { return `<span class="m">${ic("like")} Like</span><span class="m">${ic("reply")} Comment</span><span class="m">${ic("repost")} Share</span>`; }
  function ytChrome() { return `<span class="m">▶ Watch</span><span class="m">${ic("views")} 16K views</span><span class="spacer"></span><span class="m">${ic("sub")} Subscribe</span>`; }
  function dcChrome() { return `<span class="m">cfosilvia.com</span><span class="spacer"></span><span class="m">${ic("reply")} 3</span>`; }

  const chromeEl = $("#cChrome");
  const xLogo = $("#xLogo");
  const platLabel = $("#stagePlatformLabel");
  function refreshChrome() {
    const all = selected.size === Object.keys(platforms).length;
    const agnostic = agnosticBtn.getAttribute("aria-pressed") === "true" && all;
    if (agnostic || selected.size === 0) {
      chromeEl.style.display = "none"; xLogo.style.display = "none";
      platLabel.textContent = "Platform-agnostic"; return;
    }
    agnosticBtn.setAttribute("aria-pressed", "false");
    const order = ["x", "linkedin", "facebook", "youtube", "discord"];
    const primary = order.find((k) => selected.has(k));
    chromeEl.style.display = "flex";
    chromeEl.innerHTML = platforms[primary].chrome();
    xLogo.style.display = primary === "x" ? "block" : "none";
    platLabel.textContent = [...selected].map((k) => platforms[k].name).join(" · ");
  }
  refreshChrome();

  /* ---- Platform info modal ---- */
  const platModal = $("#platModal");
  const pmClose = $("#pmClose");
  function openPlatModal(key) {
    const info = platformInfoData[key];
    if (!info || !platModal) return;
    $("#pmName").textContent = info.name;
    $("#pmTime").textContent = info.time;
    $("#pmTimeNote").textContent = info.timeNote;
    const dimsEl = $("#pmDims");
    dimsEl.innerHTML = info.dims.map(d => `
      <div class="pm-dim">
        <div class="dm-label">${d.label}</div>
        <div class="dm-val">${d.val}</div>
        <div class="dm-sub">${d.sub}</div>
        <button class="pm-copy-dim" onclick="navigator.clipboard.writeText('${d.val}').then(()=>this.textContent='Copied ✓')">⎘ Copy size</button>
      </div>`).join("");
    const scenEl = $("#pmScenarios");
    scenEl.innerHTML = info.scenarios.map(s => `
      <div class="pm-scenario">
        <div class="sc-label">${s.label}</div>
        <div class="sc-desc">${s.desc}</div>
      </div>`).join("");
    $("#pmMeta").innerHTML = `<b>Required meta tags:</b><br>${info.meta}`;
    const val = info.validator;
    $("#pmValidator").innerHTML = val.url
      ? `<b>Validator:</b> <a href="${val.url}" target="_blank" rel="noopener">${val.label} ↗</a>`
      : `<b>How to test:</b> ${val.label}`;
    platModal.hidden = false;
    platModal.style.opacity = "0";
    requestAnimationFrame(() => { platModal.style.transition = "opacity .3s"; platModal.style.opacity = "1"; });
  }
  function closePlatModal() {
    if (!platModal) return;
    platModal.style.opacity = "0";
    setTimeout(() => { platModal.hidden = true; platModal.style.opacity = ""; }, 220);
  }
  if (pmClose) pmClose.addEventListener("click", closePlatModal);
  if (platModal) platModal.addEventListener("click", (e) => { if (e.target === platModal) closePlatModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePlatModal(); });

  /* ---------- compat list ---------- */
  const compat = [
    ["x", "𝕏 (Twitter)", "Card validator refresh", "~1–5 min", "after first scrape"],
    ["linkedin", "LinkedIn", "Post Inspector", "~5–30 min", "cache is sticky"],
    ["facebook", "Facebook / Messenger", "Sharing Debugger", "instant on re-scrape", "force via debugger"],
    ["discord", "Discord", "Paste link in any channel", "~instant", "edits cache ~30 min"],
    ["slack", "Slack", "Unfurls on paste", "~seconds", "re-unfurl after 30 min"],
    ["imessage", "iMessage", "Rich link preview", "~seconds", "device-cached"],
    ["sms", "Android / RCS / SMS", "Link preview (RCS)", "~seconds", "plain SMS shows URL only"],
  ];
  const compatIcons = {
    x: platIcons.x, linkedin: platIcons.linkedin, facebook: platIcons.facebook, discord: platIcons.discord,
    slack: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 14a2 2 0 11-2-2h2zm1 0a2 2 0 014 0v5a2 2 0 11-4 0zM10 6a2 2 0 11-2 2V6zm0 1a2 2 0 010 4H5a2 2 0 010-4zM18 10a2 2 0 112 2h-2zm-1 0a2 2 0 01-4 0V5a2 2 0 114 0zM14 18a2 2 0 112-2v2zm0-1a2 2 0 010-4h5a2 2 0 010 4z"/></svg>',
    imessage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.5 8.5 0 01-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1121 11.5z"/></svg>',
    sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 8h6M9 12h6"/></svg>',
  };
  const cl = $("#compatList");
  compat.forEach(([k, name, how, time, note]) => {
    const row = document.createElement("div");
    row.className = "compat";
    row.innerHTML = `<span class="pl-ic">${compatIcons[k] || ""}</span>
      <span class="nm">${name}<small>${how}</small></span>
      <span class="tt">${time}<small>${note}</small></span>`;
    cl.appendChild(row);
  });

  /* ---------- IDE data — proper logos + correct names ---------- */
  const ideData = [
    {
      name: "Cursor",
      bg: "#0a0a0a", fg: "#ffffff",
      /* cursor arrow */
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2l16 9.5-9 2L9 22z"/></svg>`
    },
    {
      name: "VS Code",
      bg: "#007acc", fg: "#ffffff",
      /* VS Code logo */
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 2.5L9.2 11 5 7 2 8.5l4.5 4L2 17.5 5 19l4-3.5 8.5 8.5L22 22V2l-4.5.5zM18 18.5L10 12l8-6.5v13z"/></svg>`
    },
    {
      name: "GitHub Copilot",
      bg: "#24292f", fg: "#ffffff",
      /* Copilot head with goggles */
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7.6 2 4 5.6 4 10v2.5c0 1.5.5 2.8 1.4 3.9L6 20h12l.6-3.6c.9-1.1 1.4-2.4 1.4-3.9V10C20 5.6 16.4 2 12 2zm-2.5 11.8a1.8 1.8 0 110-3.6 1.8 1.8 0 010 3.6zm5 0a1.8 1.8 0 110-3.6 1.8 1.8 0 010 3.6z"/></svg>`
    },
    {
      name: "Neovim",
      bg: "#57a143", fg: "#ffffff",
      /* Neovim N mark */
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 21V3h3.5l9 12V3H19v18h-3.5L6.5 9V21z"/></svg>`
    },
    {
      name: "CLI tools",
      bg: "#0d1117", fg: "#22c55e",
      /* terminal prompt >_ */
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="4 8 9 12 4 16"/><line x1="12" y1="16" x2="20" y2="16"/></svg>`
    },
    {
      name: "Windsurf",
      bg: "#4f46e5", fg: "#ffffff",
      /* Codeium/Windsurf wave */
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M2 17c4-8 8-8 12 0s8 0 8 0"/><path d="M2 11c4-6 8-6 12 0s8 0 8 0"/></svg>`
    },
    {
      name: "Codex",
      bg: "#10a37f", fg: "#ffffff",
      /* OpenAI Codex hexagon/layers */
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><polyline points="3 7 12 12 21 7"/><line x1="12" y1="12" x2="12" y2="22"/></svg>`
    },
    {
      name: "Claude Cowork",
      bg: "#d97559", fg: "#ffffff",
      /* Anthropic / Claude A-mark */
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 21h4l1.5-4h5L16 21h4L12 2zm-1 12l1.5-5 1.5 5h-3z"/></svg>`
    },
    {
      name: "Grok Build",
      bg: "#000000", fg: "#ffffff",
      /* X / xAI logo */
      svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.6h3.3l-7.2 8.2 8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.5l7.7-8.8L1 1.6h6.8l4.7 6.2zm-1.2 17.7h1.8L7.3 3.4H5.4z"/></svg>`
    },
    {
      name: "Antigravity",
      bg: "#0f172a", fg: "#38bdf8",
      /* up-arrow / anti-gravity */
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V4"/><path d="M5 11l7-7 7 7"/></svg>`
    }
  ];

  function makeIdeEl(className, ide) {
    const s = document.createElement("span");
    s.className = className;
    s.innerHTML = `<span class="ide-logo" style="background:${ide.bg};color:${ide.fg}">${ide.svg}</span>${ide.name}`;
    return s;
  }

  /* ---------- Sidebar IDE strip ---------- */
  const csIdeTrack = $("#csIdeTrack");
  if (csIdeTrack) {
    [...ideData, ...ideData].forEach(ide => csIdeTrack.appendChild(makeIdeEl("cs-ide-item", ide)));
  }

  const topIdeTrack = $("#topIdeTrack");
  if (topIdeTrack) {
    [...ideData, ...ideData].forEach(ide => topIdeTrack.appendChild(makeIdeEl("top-ide-item", ide)));
  }

  /* ---------- code sidebar (transform-slide + sound) ---------- */
  const codeSidebar = $("#codeSidebar");
  const csSnippets = $("#csSnippets");
  const openInlineBtn = $("#openDrawerInline");
  let sidebarSoundPlayed = false;

  if (openInlineBtn) openInlineBtn.addEventListener("click", () => {
    codeSidebar.classList.add("force-open");
    whoosh(-1);
    setTimeout(() => codeSidebar.classList.remove("force-open"), 4200);
  });

  if (codeSidebar) {
    codeSidebar.addEventListener("mouseenter", () => {
      buildSidebarSnippets();
      if (!sidebarSoundPlayed) { whoosh(-1); sidebarSoundPlayed = true; }
      setTimeout(() => { sidebarSoundPlayed = false; }, 3000);
    });
  }

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function hl(src) {
    let out = "", i = 0;
    const wrap = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;
    while (i < src.length) {
      if (src.startsWith("<!--", i)) {
        const end = src.indexOf("-->", i); const j = end === -1 ? src.length : end + 3;
        out += wrap("tok-cmt", src.slice(i, j)); i = j; continue;
      }
      if (src[i] === '"' || src[i] === "'") {
        const q = src[i]; let j = i + 1;
        while (j < src.length && src[j] !== q) j++;
        out += wrap("tok-str", src.slice(i, j + 1)); i = j + 1; continue;
      }
      if (src[i] === "<") {
        let j = i + 1; if (src[j] === "/") j++;
        while (j < src.length && /[\w-]/.test(src[j])) j++;
        out += wrap("tok-tag", src.slice(i, j)); i = j; continue;
      }
      const m = /^[\w:-]+(?==)/.exec(src.slice(i));
      if (m && /\s/.test(src[i - 1] || " ")) { out += wrap("tok-attr", m[0]); i += m[0].length; continue; }
      out += esc(src[i]); i++;
    }
    return out;
  }

  function cardData() {
    return {
      title: ins.title.value, eyebrow: ins.eyebrow.value, sub: ins.sub.value.replace(/\*/g, ""),
      body: ins.body.value, cta: ins.cta.value, brand: ins.brand.value,
      stats: [ins.s1.value, ins.s2.value, ins.s3.value], theme: embed.dataset.theme,
      platforms: [...selected],
      imageBase: (ins.imageBase && ins.imageBase.value) || "https://yourdomain.com/cards/",
    };
  }
  function ogSnippet() {
    const d = cardData();
    const base = (d.imageBase || "https://yourdomain.com/cards/").replace(/\/$/, "");
    const img = `${base}/${d.theme}.png`;
    return `<!-- Put inside <head> on your site (the page that will be embedded/shared) -->
<meta property="og:title" content="${d.title} — ${d.sub}" />
<meta property="og:description" content="${d.body}" />
<meta property="og:image" content="${img}" />
<meta property="og:url" content="https://yourdomain.com" />
<meta property="og:type" content="website" />

<!-- 𝕏 / Twitter large summary card (critical for good previews) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${d.title} — ${d.sub}" />
<meta name="twitter:description" content="${d.body}" />
<meta name="twitter:image" content="${img}" />`;
  }
  function iframeSnippet() {
    return `<!-- Drop where you want the card to appear -->
<iframe src="https://cfosilvia.com/embed?theme=${embed.dataset.theme}"
        width="380" height="560" frameborder="0"
        title="CFO Silvia card" loading="lazy"></iframe>`;
  }
  function oembedSnippet() {
    return `<!-- Discoverable oEmbed endpoint -->
<link rel="alternate" type="application/json+oembed"
      href="https://cfosilvia.com/oembed?url=https://cfosilvia.com&format=json"
      title="CFO Silvia" />`;
  }

  const snippetDescs = {
    og: {
      heading: "Best practices — Open Graph + 𝕏 tags",
      items: [
        "Upload your exported PNG to a stable public URL — e.g. <code>https://yoursite.com/cards/gloss.png</code>",
        "Use absolute URLs for <code>og:image</code>. Relative paths are not supported by social platforms.",
        "Recommended image size: <code>1200 × 630px</code> JPG or PNG, max 5MB, sRGB color space.",
        "Keep filenames stable. Changing the filename invalidates all platform caches.",
        "Re-validate in each platform's debugger after deploy: X Card Validator, LinkedIn Post Inspector, Facebook Sharing Debugger.",
        "<strong>Web vs. mobile:</strong> Supply 2:1 (1200×630) for web; some mobile clients crop to square center — keep key content in the middle.",
        "<strong>Ad campaigns:</strong> Use platform-specific sizes (X: 1200×628, LinkedIn: 1200×627, Meta ads: 1080×1080) for paid placements."
      ]
    },
    iframe: {
      heading: "Best practices — Inline iframe embed",
      items: [
        "Most live sites block iframe embedding via <code>X-Frame-Options: SAMEORIGIN</code> or CSP <code>frame-ancestors</code>.",
        "Best use: embed your own page (same domain) or a dedicated embed endpoint you control.",
        "Recommended dimensions: <code>width=\"380\" height=\"560\"</code> for card format; adjust for your layout.",
        "<code>loading=\"lazy\"</code> defers the iframe until it's near the viewport — use this for performance.",
        "For 𝕏/LinkedIn/Discord: use the Open Graph tags above instead — iframes are not supported in those link previews.",
        "<strong>Mobile:</strong> Wrap in a responsive container (<code>aspect-ratio: 380/560</code>) and set <code>width: 100%</code>."
      ]
    },
    oembed: {
      heading: "Best practices — oEmbed endpoint",
      items: [
        "oEmbed allows Slack, Discord, and CMS tools to auto-discover rich embed metadata from a URL.",
        "Add this <code>&lt;link&gt;</code> tag to your page's <code>&lt;head&gt;</code> alongside the standard OG tags.",
        "Slack and Discord will use the oEmbed endpoint if available, falling back to OG tags.",
        "Your oEmbed endpoint should return JSON: <code>type, title, author_name, thumbnail_url, thumbnail_width, thumbnail_height</code>.",
        "<strong>Recommended:</strong> Use a static JSON file at the specified href URL if you don't want to build a dynamic endpoint."
      ]
    }
  };

  function buildSidebarSnippets() {
    if (!csSnippets) return;
    const blocks = [
      { h: "Open Graph + 𝕏 tags", loc: "&lt;head&gt;", code: ogSnippet(), descKey: "og" },
      { h: "Inline iframe embed", loc: "&lt;body&gt;", code: iframeSnippet(), descKey: "iframe" },
      { h: "oEmbed (Slack/Discord)", loc: "&lt;head&gt;", code: oembedSnippet(), descKey: "oembed" },
    ];
    csSnippets.innerHTML = "";
    blocks.forEach((b) => {
      const desc = snippetDescs[b.descKey];
      const wrap = document.createElement("div");
      wrap.className = "cs-snippet-block";
      wrap.innerHTML = `
        <div class="sh">
          <h4>${b.h}</h4>
          <div class="sh-right">
            <span class="loc">${b.loc}</span>
            <button class="fullscreen-btn" title="Fullscreen">⤢</button>
          </div>
        </div>
        <pre><code>${hl(b.code)}</code></pre>
        <div class="snippet-actions">
          <button class="copybtn">Copy</button>
        </div>
        <button class="snippet-expand-btn">▸ Best practices &amp; file location guide</button>
        <div class="snippet-desc" style="display:none">
          <h4>${desc.heading}</h4>
          <ul>${desc.items.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>`;

      wrap.querySelector(".copybtn").addEventListener("click", (e) => {
        navigator.clipboard.writeText(b.code).then(() => {
          const t = e.target; t.textContent = "Copied ✓"; t.classList.add("done");
          setTimeout(() => { t.textContent = "Copy"; t.classList.remove("done"); }, 1400);
        });
      });

      wrap.querySelector(".fullscreen-btn").addEventListener("click", () => openSnippetFs(b.h, b.loc.replace(/&lt;|&gt;/g, m => m === "&lt;" ? "<" : ">"), b.code, desc));

      const expandBtn = wrap.querySelector(".snippet-expand-btn");
      const descEl = wrap.querySelector(".snippet-desc");
      expandBtn.addEventListener("click", () => {
        const open = descEl.style.display !== "none";
        descEl.style.display = open ? "none" : "block";
        expandBtn.textContent = open ? "▸ Best practices & file location guide" : "▾ Hide best practices";
      });

      csSnippets.appendChild(wrap);
    });
  }
  buildSidebarSnippets();

  /* ---------- Fullscreen snippet modal ---------- */
  const snippetFs = $("#snippetFs");
  const sfClose = $("#sfClose");
  const sfCopy = $("#sfCopy");
  let currentSnippetCode = "";

  function openSnippetFs(title, loc, code, desc) {
    if (!snippetFs) return;
    currentSnippetCode = code;
    $("#sfTitle").textContent = title;
    $("#sfLoc").textContent = "Place in: " + loc;
    const sfCode = $("#sfCode");
    sfCode.innerHTML = hl(code);
    const sfDesc = $("#sfDesc");
    if (desc) {
      sfDesc.innerHTML = `<h4>${desc.heading}</h4><ul>${desc.items.map(item => `<li>${item}</li>`).join("")}</ul>`;
      sfDesc.style.display = "block";
    } else {
      sfDesc.style.display = "none";
    }
    snippetFs.hidden = false;
    snippetFs.style.opacity = "0";
    requestAnimationFrame(() => { snippetFs.style.transition = "opacity .25s"; snippetFs.style.opacity = "1"; });
    whoosh(-1);
  }

  function closeSnippetFs() {
    if (!snippetFs) return;
    snippetFs.style.opacity = "0";
    setTimeout(() => { snippetFs.hidden = true; snippetFs.style.opacity = ""; }, 220);
  }

  if (sfClose) sfClose.addEventListener("click", closeSnippetFs);
  if (snippetFs) snippetFs.addEventListener("click", (e) => { if (e.target === snippetFs) closeSnippetFs(); });
  if (sfCopy) sfCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(currentSnippetCode).then(() => {
      sfCopy.textContent = "Copied ✓"; sfCopy.classList.add("done");
      setTimeout(() => { sfCopy.textContent = "Copy snippet"; sfCopy.classList.remove("done"); }, 1400);
    });
  });

  /* ---------- Grab files button ---------- */
  const grabFilesBtn = $("#grabFilesBtn");
  if (grabFilesBtn) {
    grabFilesBtn.addEventListener("click", () => {
      toast("Preparing zip bundle…");
      exportZip();
    });
  }

  /* ---------- Top-left teaser → scroll to compat modal + sidebar brighter ---------- */
  const embedTeaser = document.getElementById("embedTeaser");
  const embedsModal = document.getElementById("embedsInfo");
  if (embedTeaser && codeSidebar) {
    embedTeaser.addEventListener("mouseenter", () => codeSidebar.classList.add("brighter"));
    embedTeaser.addEventListener("mouseleave", () => codeSidebar.classList.remove("brighter"));
    embedTeaser.addEventListener("click", () => {
      if (embedsModal) {
        embedsModal.scrollIntoView({ behavior: "smooth", block: "center" });
        embedsModal.classList.add("flash");
        setTimeout(() => embedsModal.classList.remove("flash"), 1350);
      }
      codeSidebar.classList.add("brighter");
      setTimeout(() => codeSidebar.classList.remove("brighter"), 1600);
    });
  }

  /* ---------- export ---------- */
  function download(name, content, type = "text/plain") {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function standaloneHTML() {
    const d = cardData();
    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${d.title} — CFO Silvia card</title>
${ogSnippet()}
<style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#0a0a0b;font-family:Georgia,serif}
.card{width:380px;border-radius:18px;overflow:hidden;border:1px solid #222;background:#0c0c0f;color:#f4f1ea;box-shadow:0 30px 90px -30px #000}
.card .p{padding:20px;display:flex;flex-direction:column;gap:12px}
.eb{font-size:12px;font-family:Arial}.t{font-size:46px;color:#f6d57a;margin:0}.s{font-size:20px}
.b{font-size:13px;font-family:Arial;color:#ddd}.cta{align-self:flex-start;padding:11px 20px;border-radius:11px;background:linear-gradient(160deg,#e7b23c,#d99f28);color:#1a1407;font-family:Arial;font-weight:700;border:none}
.f{text-align:center;font-family:Arial;font-size:11px;color:#bbb;padding-bottom:16px}</style></head>
<body><div class="card"><div class="p">
<span class="eb">${d.eyebrow}</span><h1 class="t">${d.title}</h1><div class="s">${d.sub}</div>
<p class="b">${d.body}</p><button class="cta">${d.cta}</button></div>
<div class="f"><b>${d.brand}</b><br>From cfosilvia.com</div></div></body></html>`;
  }
  function markdownDoc() {
    const d = cardData();
    return `# ${d.title} — CFO Silvia card

> ${d.sub}

${d.body}

**Proof:** ${d.stats.join(" · ")}
**CTA:** ${d.cta}
**Theme:** ${d.theme}  ·  **Platforms:** ${d.platforms.join(", ")}

## Open Graph tags
\`\`\`html
${ogSnippet()}
\`\`\`

_Best practice:_ render the card to \`/cards/${d.theme}.png\`, keep the OG image URL stable, and re-validate in each platform's tool after you ship.`;
  }
  async function exportZip() {
    if (!window.JSZip) { toast("Zip library still loading — try again in a second"); return; }
    const zip = new JSZip();
    const d = cardData();
    zip.file("card.html", standaloneHTML());
    zip.file("card.md", markdownDoc());
    zip.file("card.json", JSON.stringify(d, null, 2));
    zip.file("embed-snippets.html", ogSnippet() + "\n\n" + iframeSnippet() + "\n\n" + oembedSnippet());
    zip.file("README.md", `# embedCardsCrafted — card bundle\n\nDrop \`card.html\` anywhere, or copy the tags from \`embed-snippets.html\` into your site head.\n\n## Where to upload card PNG\n- Static / Vercel / Netlify: /public/cards/\n- Next.js: public/cards/ (served as /cards/gloss.png)\n- Plain HTML: cards/ folder next to index.html\n\nOpen in Cursor, Claude Cowork, VS Code, Neovim, Windsurf — wherever you work.\n\nSource: https://github.com/jimbrend/embedCardsCrafted`);
    const blob = await zip.generateAsync({ type: "blob" });
    download("embedcraftedcards-bundle.zip", blob);
    toast("Zip bundle downloaded — open in your IDE or workflow");
  }
  async function exportPNG() {
    if (!window.html2canvas) { toast("Image library still loading — try again"); return; }
    toast("Rendering PNG…");
    const canvas = await html2canvas(embed, { backgroundColor: null, scale: 2, useCORS: true });
    canvas.toBlob((b) => { download("cfo-silvia-card.png", b, "image/png"); toast("PNG saved"); });
  }
  $$(".exp").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.exp;
    if (k === "html") download("card.html", standaloneHTML(), "text/html"), toast("card.html downloaded");
    else if (k === "md") download("card.md", markdownDoc(), "text/markdown"), toast("card.md downloaded");
    else if (k === "raw") download("card.json", JSON.stringify(cardData(), null, 2), "application/json"), toast("card.json downloaded");
    else if (k === "zip") exportZip();
    else if (k === "png") exportPNG();
    else if (k === "src") toast("Source cards live in /assets — card-01…08.jpg");
  }));

  /* ---------- federal holidays + suggestions (staging) ---------- */
  const holidays = [
    ["Jan 1", "New Year's Day"], ["Jan 19", "MLK Jr. Day"], ["Feb 16", "Presidents' Day"],
    ["May 25", "Memorial Day"], ["Jun 19", "Juneteenth"], ["Jul 3", "Independence Day (obs.)"],
    ["Sep 7", "Labor Day"], ["Oct 12", "Columbus Day"], ["Nov 11", "Veterans Day"],
    ["Nov 26", "Thanksgiving"], ["Dec 25", "Christmas Day"],
  ];
  const hl2 = $("#holidayList");
  if (hl2) holidays.forEach(([d, n]) => {
    const el = document.createElement("div"); el.className = "holiday";
    el.innerHTML = `<span>${n}</span><span class="d">${d}</span>`;
    el.addEventListener("click", () => {
      ins.eyebrow.value = "Markets closed for " + n.replace(/ \(.*/, "") + ".";
      ins.sub.value = "A *holiday* worth its weight in gold.";
      ins.cta.value = "Check your position";
      sync(); toast("Card themed for " + n);
    });
    hl2.appendChild(el);
  });
  const suggestions = [
    "Tie today's card to the 10-year yield move",
    "Seasonal: Q-end rebalance reminder",
    "Spotlight a $2.5M net-worth milestone",
    "Earnings-week watchlist teaser",
    "Holiday-hours notice for closed markets",
    "FOMC day: rate-decision explainer card",
  ];
  function renderSuggestions() {
    const box = $("#suggestList"); if (!box) return; box.innerHTML = "";
    suggestions.forEach((s, i) => {
      const el = document.createElement("div"); el.className = "sugg"; el.textContent = s;
      el.addEventListener("click", () => { ins.body.value = s + ". Institutional-grade analysis, around the clock."; sync(); toast("Suggestion applied"); });
      box.appendChild(el);
      setTimeout(() => el.classList.add("in"), 120 * i + 200);
    });
  }

  /* ---------- mode switch (Build / Production / Staging) ---------- */
  const modeBtns = $$(".modebtn");
  const prodView = $("#production"), stageView = $("#staging");
  let currentMode = "build";
  function setMode(next) {
    if (next === currentMode) return;
    whoosh(next === "staging" ? 1 : -1);
    modeBtns.forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === next));
    const isStaging = next === "staging";
    if (isStaging) {
      prodView.classList.add("swoosh-out");
      setTimeout(() => {
        document.body.dataset.env = "staging"; document.body.dataset.mode = "staging";
        prodView.classList.remove("swoosh-out");
        stageView.classList.add("swoosh-in");
        setTimeout(() => stageView.classList.remove("swoosh-in"), 620);
        renderSuggestions();
        checkFrame();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 280);
    } else {
      if (document.body.dataset.env === "staging") stageView.classList.add("swoosh-out");
      setTimeout(() => {
        document.body.dataset.env = "production"; document.body.dataset.mode = next;
        stageView.classList.remove("swoosh-out");
        prodView.classList.add("swoosh-in");
        setTimeout(() => prodView.classList.remove("swoosh-in"), 620);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 260);
    }
    if (next === "production") document.documentElement.style.setProperty("--studio-col", "1fr");
    else document.documentElement.style.removeProperty("--studio-col");
    const topnav = $("#topnav");
    topnav.style.opacity = isStaging ? ".62" : "1";
    currentMode = next;
  }
  modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
  modeBtns.forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === "build"));

  /* ---------- campaign overlay ---------- */
  const genLaunch = $("#genLaunch");
  const cp = $("#campaignPreview");
  const cpGo = $("#cpGo");
  const cpCancel = $("#cpCancel");
  if (genLaunch) genLaunch.addEventListener("click", () => {
    genLaunch.style.transitionDuration = "520ms";
    genLaunch.style.transform = "translateY(-1px) scale(.985)";
    setTimeout(() => {
      genLaunch.style.transform = ""; genLaunch.style.transitionDuration = "";
      if (cp) { cp.hidden = false; cp.style.opacity = "0"; requestAnimationFrame(() => { cp.style.transition = "opacity .4s var(--ease)"; cp.style.opacity = "1"; }); }
    }, 380);
  });
  function goToStaging() {
    if (cp) { cp.style.opacity = "0"; setTimeout(() => { cp.hidden = true; cp.style.opacity = ""; }, 220); }
    toast("Entering campaign process…"); setMode("staging");
  }
  if (cpGo) cpGo.addEventListener("click", goToStaging);
  if (cpCancel) cpCancel.addEventListener("click", () => {
    if (cp) { cp.style.opacity = "0"; setTimeout(() => { cp.hidden = true; cp.style.opacity = ""; }, 180); }
  });
  if (cp) cp.addEventListener("click", (e) => { if (e.target.id === "campaignPreview") goToStaging(); });

  /* ---------- live iframe + float dock — improved detection ---------- */
  const liveFrame = $("#liveFrame");
  const liveFallback = $("#liveFallback");
  let liveLoaded = false;
  let checkTimer;

  function checkFrame() {
    liveLoaded = false;
    if (liveFallback) liveFallback.style.display = "none";
    clearTimeout(checkTimer);
    checkTimer = setTimeout(() => {
      if (!liveLoaded && liveFallback) liveFallback.style.display = "grid";
    }, 5000);
  }

  if (liveFrame) {
    liveFrame.addEventListener("load", () => {
      clearTimeout(checkTimer);
      try {
        const doc = liveFrame.contentDocument;
        if (doc && doc.body && doc.body.innerHTML.trim().length > 80) {
          liveLoaded = true;
          if (liveFallback) liveFallback.style.display = "none";
        } else {
          if (liveFallback) liveFallback.style.display = "grid";
        }
      } catch (e) {
        // Cross-origin but probably loaded (site blocks framing, expected)
        if (liveFallback) liveFallback.style.display = "grid";
      }
    });
    liveFrame.addEventListener("error", () => {
      if (liveFallback) liveFallback.style.display = "grid";
    });
  }

  function popLive() { window.open("https://www.cfosilvia.com", "_blank", "noopener,width=460,height=820"); }
  const popLiveBtn = $("#popLive"), popLive2Btn = $("#popLive2");
  if (popLiveBtn) popLiveBtn.addEventListener("click", popLive);
  if (popLive2Btn) popLive2Btn.addEventListener("click", popLive);
  const floatLive = $("#floatLive");
  const floatLiveBtn = $("#floatLiveBtn");
  if (floatLiveBtn) floatLiveBtn.addEventListener("click", () => { floatLive && floatLive.classList.add("show"); toast("Docked cfosilvia.com"); });
  const flClose = $("#flClose"), flPop = $("#flPop");
  if (flClose) flClose.addEventListener("click", () => floatLive && floatLive.classList.remove("show"));
  if (flPop) flPop.addEventListener("click", popLive);

  /* ---------- keyboard shortcuts ---------- */
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input,textarea")) return;
    const k = e.key.toLowerCase();
    if (k === "s") setMode("staging");
    if (k === "p") setMode("production");
    if (k === "b") setMode("build");
    if (k === "escape") { closeSnippetFs(); closePlatModal(); }
  });

  document.body.dataset.mode = "build";
  document.body.dataset.env = "production";
})();

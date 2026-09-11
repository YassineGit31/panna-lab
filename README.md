# 365 Days → Cybersecurity Job Ready

Rebuilt, employability-first version of the 365-day cybersecurity curriculum, targeting
junior SOC Analyst / Cybersecurity Analyst / Network & Security Administrator roles,
optimized for the Algerian job market while staying internationally relevant.

## Files

- `index.html` — the entire site (curriculum data is embedded inline, so this one file works standalone, even opened directly by double-click, with no server or fetch required).
- `styles.css` — all styling.
- `app.js` — all logic: rendering, search/filters, progress tracking, notes (all stored in the visitor's browser via `localStorage`, nothing is sent anywhere).
- `data.json` — the same curriculum data as a standalone file, kept for convenience if you want to edit/regenerate content programmatically. It is **not** loaded at runtime (it's inlined in `index.html`), so editing this file alone won't change the live site — see below.

## Deploying to GitHub Pages

1. Replace the old `365-days-cybersecurity.html` (or point your Pages config at this folder).
2. Push `index.html`, `styles.css`, and `app.js` to your `panna-lab` repo.
3. If you keep the old filename for links you've already shared, just rename `index.html` accordingly, or add a redirect from the old path.

## What changed vs. the original

- Restructured from a generic "one domain per weekday" rotation into **11 employability-ordered phases**
  (Networking → Linux → Windows Server/AD → Foundations → SOC/Blue Team → Wazuh/SIEM → IR/DFIR →
  Pentest/Web → Network Security/Firewalls → Cloud/Automation → Job Prep + Final Project), covering all 365 days.
- Every day now has: objectives, short theory, a **hands-on practical task**, a named tool, a mini challenge,
  a knowledge check, time estimate, difficulty, career relevance, and a 5-minute Cyber English block.
- Every 6th day is a **lab/build day**; every 7th is a **spaced-repetition review day**; every 30th is a
  **timed practical assessment** (investigate a login, analyze a PCAP, find the compromised host, etc.).
- **10 portfolio projects** are placed across the year, and days 350–365 are a dedicated **"Build Your Own SOC"**
  capstone (Firewall → AD → endpoints → Wazuh, with 7 simulated-attack investigations).
- Added a **dashboard** (year-progress ring, streaks, 10 tracked skills mapped to phases), a **searchable/filterable
  365-day explorer**, a **certification roadmap**, and a dedicated **final project** section — all responsive and
  built with a dark SOC-monitoring aesthetic.
- Progress, completion state, and personal notes persist locally per-browser via `localStorage` — no backend needed.

## Regenerating the curriculum data

The full 365-day dataset was generated from a Python script (`gen_data.py`, not included here but easy to
recreate) that defines per-phase topic lists, lab tasks, and portfolio projects, then assigns learning/lab/review/
exam days across each phase's day range. If you want to tweak specific days, the simplest path is to edit
`data.json`, then re-embed it into `index.html` by replacing the contents of the
`<script id="curriculum-data" type="application/json">…</script>` block with the new JSON.

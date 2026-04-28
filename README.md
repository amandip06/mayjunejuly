# 🎯 TARGET26 — Mission Control

A futuristic, feature-rich **2-month challenge tracker** built with pure HTML, CSS, and JavaScript. No backend required — all data is stored in your browser's `localStorage`.

---

## 🚀 Quick Start

1. Download all 4 files into the **same folder**:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`

2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).

3. Log in with the default password: **`TARGET26`**

---

## 📅 Mission Details

| Field | Value |
|-------|-------|
| Start Date | 13 May 2026 |
| End Date | 13 July 2026 |
| Total Days | 62 |

### Daily Tasks

| # | Task | Daily Target |
|---|------|-------------|
| 1 | 🇪🇸 Learn Spanish | 30 minutes |
| 2 | 💪 Workout | 1 hour |
| 3 | ☕ Learn Java | 1 hour 30 minutes |

---

## 🔐 Password & Security

- **Default password:** `TARGET26`
- Change your password anytime in **Settings → Change Password**
- Login state is saved in `localStorage` so you stay logged in between sessions
- Logging out clears the login state

---

## ⚡ Features

### Core
- ✅ Password-protected login with animated UI
- ✅ Activate / Deactivate the system (beautiful offline screen)
- ✅ Daily checklist — tick/untick any task for any date
- ✅ Progress saved automatically in `localStorage`
- ✅ History persists until manually cleared

### Dashboard
- ✅ Stats cards: Total Days, Completed Days, Missed Days, Best Streak
- ✅ Overall mission progress bar
- ✅ Task-wise progress bars with total time
- ✅ Weekly activity bar chart
- ✅ Dynamic motivational quotes based on your progress

### Today View
- ✅ Date navigator (Previous / Next day)
- ✅ Task cards with click-to-toggle
- ✅ Daily summary: completed tasks, time done, completion %
- ✅ Status indicator (Today / Past / Future / Out-of-range)

### Calendar View
- ✅ Full mission calendar (13 May – 13 Jul)
- ✅ Color-coded days: Full ✅ / Partial 🟡 / Missed ❌ / Future / Today
- ✅ Click any past day to jump to that day's tasks

### History
- ✅ Scrollable list of all past days
- ✅ Filter by: All / Complete / Partial / Missed
- ✅ Per-day task badges and completion %

### Analytics
- ✅ Current Streak 🔥
- ✅ Best Streak ⭐
- ✅ Overall completion %
- ✅ Total time invested
- ✅ **Daily Progress Chart** (line chart — last 14 days)
- ✅ **Task-wise Completion Chart** (doughnut chart)
- ✅ **Overall Mission Chart** (horizontal bar — full breakdown)

### Settings
- ✅ Change password
- ✅ Activate / Deactivate system
- ✅ **Export progress as JSON** (backup)
- ✅ **Import progress from JSON** (restore)
- ✅ **Clear All History** (with confirmation modal)
- ✅ Dark / Light mode toggle
- ✅ Animations on/off toggle

---

## 🎨 Design

- **Futuristic glassmorphism** UI with neon glow effects
- **Fonts:** Orbitron (display), Rajdhani (body), Share Tech Mono (mono)
- **Animated** loading screen, floating particles, progress bars, chart renders
- **Fully responsive** — works on mobile, tablet, and desktop
- **Dark & Light modes** — persisted between sessions

---

## 💾 Data Storage

All data is stored in `localStorage` under these keys:

| Key | Contents |
|-----|----------|
| `tg26_password` | Hashed access password |
| `tg26_loggedIn` | Login session state |
| `tg26_active` | System active/inactive |
| `tg26_progress` | All daily task completions |
| `tg26_theme` | dark / light preference |
| `tg26_animations` | Animations on/off |

---

## 📤 Backup & Restore

- Go to **Settings → Export JSON** to download a backup file
- Go to **Settings → Import JSON** to restore from a backup
- Exports are named `target26-progress-YYYY-MM-DD.json`

---

## 🛠 Tech Stack

| Technology | Use |
|------------|-----|
| HTML5 | Structure |
| CSS3 | Glassmorphism, animations, responsive layout |
| Vanilla JavaScript (ES6+) | All logic, state management |
| Chart.js v4 | All graphs and charts |
| Google Fonts | Orbitron, Rajdhani, Share Tech Mono |
| localStorage | 100% client-side data persistence |

---

## 📁 File Structure

```
target-tracker/
├── index.html     ← Main HTML structure
├── style.css      ← All styles + animations + responsive
├── script.js      ← Full app logic + charts
└── README.md      ← This file
```

---

## ⚠️ Notes

- History is **never auto-deleted** — only cleared manually via Settings
- Future dates cannot be checked (only today and past dates)
- The system works fully **offline** — no internet required after first load (Google Fonts require internet)
- For 100% offline use, download the fonts locally or remove the Google Fonts link

---

*Built for the TARGET26 challenge: 13 May – 13 July 2026* 🎯

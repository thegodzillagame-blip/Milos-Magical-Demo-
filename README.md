# Milo's Magical Demo

**A FNAF-style fan game demo — Milo's Magical Dinner and Show (1988)**

> *"Corporate refused to pay for a proper fix. You're the night maintenance worker."*

---

## Files

```
milos-magical-demo/
├── index.html        ← Main game (open this in a browser or deploy to GitHub Pages)
├── game-data.js      ← All static data: characters, nights, lore, kill lines
├── engine.js         ← Game loop, AI logic, state machine (no DOM dependency)
├── audio.js          ← Procedural Web Audio engine (no external sound files needed)
└── README.md
```

---

## How to deploy on GitHub Pages

1. Create a new GitHub repository (e.g. `milos-magical-demo`)
2. Upload all four files to the repo root
3. Go to **Settings → Pages**
4. Under **Source**, select `main` branch, `/ (root)` folder
5. Click **Save**
6. Your game will be live at `https://yourusername.github.io/milos-magical-demo/`

---

## Keybinds

| Key | Action |
|-----|--------|
| ← → | Look around the booth |
| C   | Toggle cameras |
| L   | Toggle booth light |
| D   | Hold door (hold key down) |
| H   | Hold hatch (hold key down) |
| 1–4 | Switch camera tabs |

---

## Characters

| Character | Role | Counter |
|-----------|------|---------|
| 🎩 Milo Macawbre | Star magician | Close cameras (misdirection mechanic) |
| 🐰 Riley Rabbit | Burned-out assistant | Hold the hall door |
| 🦎 Gail the Gecko | Fortune teller | Hold the hatch |
| 🦌 Gizelle Gazelle | Comedy duo (brain) | Watch rafters cam |
| 🦌 Anthony Antelope | Comedy duo (brawn) | Hold the hall door |

---

## Lore

- **1948** — Antonio Brown's father is born (a struggling magician and performer)
- **1962** — Antonio Brown (future founder) is born
- **1988** — *Milo's Magical Dinner and Show* opens its doors
- **1989** — *The Incident of '89*: a child entered Milo's disappearing cabinet and never came out. Covered up by the company.

---

## Architecture

The codebase is split into three concerns — matching the Hilastone pattern:

- **`game-data.js`** — pure data, no logic, easy to edit
- **`engine.js`** — pure logic, no DOM access, talks to UI via events
- **`audio.js`** — self-contained audio module, all sounds procedural
- **`index.html`** — UI layer only, wires engine events to DOM

The engine emits named events (`dirChange`, `camToggle`, `jumpscare`, etc.) and the UI layer responds. This means the game logic can eventually be ported to Clickteam Fusion 2.5 without rewriting the design.

---

## Planned for full game

- Blender pre-rendered assets replacing emoji tokens
- Clickteam Fusion 2.5 engine port
- Firebase high score / night tracking
- Additional nights and secret lore unlocks
- Phone call audio logs (Antonio's voicemails)

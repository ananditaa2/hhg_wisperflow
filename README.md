# YapLab

**Say it. Run it. Refine it.** YapLab is a voice-first component playground with a small arcade, voice-triggered utilities, and audio tools.

YapLab centers on Voice Studio: speak a supported request, inspect the selected starter code, run it in an isolated preview, and refine a hero headline, background theme, or CTA by voice. The other tabs are supporting voice and audio experiments.

## The Four Features

### Voice Arcade
Play Scream Runner with microphone volume and spoken commands. Talking or shouting makes the runner jump; say “blast” to clear obstacles or “shield” for protection. Collect coins and beat your high score.

### Voice Studio
Speak a supported UI or coding request and YapLab maps it to a curated React/TypeScript starter template. In the Hero starter, supported voice patches change the headline, background palette, or primary CTA; **Undo last voice edit** restores the previous code. Use **Code** to inspect the source or **Run** to preview components, hooks, and plain functions in an isolated iframe. Function previews accept JSON arguments. Unsupported requests show a clear no-match starter instead of pretending arbitrary code was generated. Packages the preview cannot load show an error rather than a blank screen.

### Voice Triggers
Say or type a command to save a note, add a to-do, read back open tasks, or start a focus timer. Notes, to-dos, and timer state persist in this browser's local storage. The four-step view shows how a phrase becomes an action. These examples update the page only; they do not run shell commands, deploy services, or scan project files.

### Pitch & Spectrum
Use your microphone to see a detected note, frequency, and sharp/flat offset across approximately 25–1,000 Hz. Select Voice, Guitar, Bass, Ukulele, or Other. Guitar, bass, and ukulele modes compare the note with standard tuning strings. Play or sing one clear note at a time; this is not a chord detector or song recognizer. The spectrum shows sound energy and harmonics, while the level meter is relative rather than calibrated decibels.

## Run Locally

### Requirements
- Node.js 18 or later
- A modern browser
- Microphone permission for live audio and speech features

### Setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

To run the standalone generated hero playground, open `/o.html` on the same Vite server.

## Build

```bash
npm run build
```

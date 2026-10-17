# AURORA — Cinematic Personal Command Centre

Premium dark dashboard inspired by luxury automotive interfaces and nighttime photography.

Built for @popcorn_party1.

## Features

- Full-screen cinematic Ferrari-in-the-rain background (video or high-quality still + CSS rain)
- Compact top bar with live clock, status, search/command palette, profile link
- Collapsible sidebar with Overview, Smart Home, Creator and System sections
- Overview with status modules, smart-home setup state, camera panel, creator card, activity feed and quick actions
- YouTube workspace with editable video ideas (localStorage), publishing checklist and channel link
- Placeholder pages for Devices, Cameras, Lighting, Activity, Network and Settings
- Modular structure ready for Home Assistant and YouTube Data API
- Respects prefers-reduced-motion
- Glass surfaces, restrained Ferrari red accent, Inter + Space Grotesk typography

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Background Assets

Place files in `public/media/`:

- `ferrari-rain.mp4` — preferred looping cinematic video (muted, autoplay, loop, playsInline)
- `ferrari-fallback.jpg` — high-quality still used when video is unavailable

The current build includes a fallback image. Update `src/App.tsx` or the BackgroundScene component to prefer the video element when present.

## Home Assistant

Configure base URL and token via a secure backend or environment variables. Never commit long-lived tokens. The Settings page contains a setup prompt.

## YouTube

Public channel link works immediately: https://www.youtube.com/@popcorn_party1

Private analytics require the official YouTube Data API and OAuth. Content planning tools work offline.

## Demo Data

All smart-home, camera and activity values are explicitly marked as demo or “Not connected” until real integrations are configured.

## Tech

React 18 + TypeScript + Vite + Lucide icons. No unnecessary dependencies.

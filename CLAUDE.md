# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThitaInfo Games is a real-time multiplayer typing game platform built with Next.js 14 and Socket.io. The primary game is "Typer" - a typing speed test with single player, race, and challenge modes.

## Commands

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Docker (production)
docker-compose up --build

# Docker (local development)
docker-compose -f docker-compose.local.yml up --build
```

## Architecture

### Server Architecture

- **Custom Node.js server** (`server.js`): HTTP server with Next.js request handler + Socket.io integration
- Socket.io mounted at `/api/socket.io` path
- Graceful shutdown handling with 10-second timeout

### Code Organization

```
app/                    # Next.js App Router
├── api/typer/          # REST API endpoints (create-room, join-room, save-result, etc.)
├── typer/              # Game pages (single player, race, challenge)
├── layout.js           # Root layout with ErrorBoundary
components/
├── typer/              # Game-specific components (ModeSelector, RoomLobby, LiveLeaderboard)
├── ui/                 # Reusable Radix-based components with CVA variants
├── ErrorBoundary.jsx   # Global error boundary for graceful error handling
lib/
├── db.js               # Shared MongoDB connection with pooling (use getDB())
├── constants.js        # Shared constants (TYPING_TEXTS, getRandomText())
├── socket/server.js    # Socket.io event handlers and MongoDB integration
├── socket/client.js    # useSocket() hook (singleton pattern)
├── utils.js            # cn() function for Tailwind class merging
```

### Database

- MongoDB with centralized connection pooling via `lib/db.js`
- All API routes use `getDB()` for database access
- Collections: `typer_results`, `typer_rooms`, `typer_race_results`, `typer_challenges`

### Real-time Communication

- Socket.io events: `join-room`, `leave-room`, `player-progress`, `player-finished`, `start-race`
- Server broadcasts: `room-update`, `race-countdown`, `race-started`, `race-finished`
- WebSocket preferred with polling fallback

### Game Logic

- **Single Player**: WPM = wordsTyped / timeInMinutes, Accuracy = correctChars / totalChars \* 100
- **Race Mode**: Room host starts countdown → real-time progress via Socket.io → first to finish wins
- **Challenge Mode**: Shareable links for asynchronous competition

## Key Patterns

### Shared Constants

Typing texts are centralized in `lib/constants.js`. Use `getRandomText()` to get a random text or import `TYPING_TEXTS` array directly.

### Room ID Generation

6-character alphanumeric codes generated server-side with uniqueness check.

### Component Pattern

All page components use `"use client"` directive. UI components use Radix primitives with CVA for variants.

## Environment Variables

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=thitainfo_games
NODE_ENV=development|production
PORT=3000
HOSTNAME=localhost
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000  # optional, defaults to window.origin
CORS_ORIGINS=comma-separated origins
```

## Tech Stack

- Next.js 14 (App Router), React 18, Tailwind CSS 3.4
- Socket.io (client + server), MongoDB 6.6+
- Radix UI primitives, Lucide React icons
- Docker (Node.js 18 Alpine, multi-stage build)

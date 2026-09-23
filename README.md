# RISE — Real Intelligence for Self Evolution

> A JARVIS-style personal AI assistant and productivity 
> dashboard built with React + Vite.

## Features
- Dual UI modes: JARVIS (dark) and Rise (light)
- SHA-256 password lock screen
- AI chat with smart routing — Gemini 2.0 Flash for general 
	queries, deepseek-r1:8b via Ollama for sensitive content
- GitHub activity monitor
- AI Engineer skill roadmap (game-map style)
- Fitness tracker
- Pomodoro timer
- Daily checklist and notepad
- AI news feed
- LinkedIn reminder system
- Local persistence via IndexedDB

## Tech Stack
- Frontend: React, Vite, TypeScript, Tailwind CSS
- AI: Gemini 2.0 Flash API, Ollama (llama3.1:8b, deepseek-r1:8b)
- UI components: shadcn/ui, Recharts
- Storage: IndexedDB, localStorage

## Getting Started

### Prerequisites
- Node.js 18+
- Ollama installed and running locally
- Gemini API key

### Setup
1. Clone the repo
2. Run: npm install
3. Copy .env.example to .env and fill in your keys
4. Run: npm run dev
5. Open http://localhost:5173

## Project Structure
- src/components/ — All page and feature components
- src/services/ — AI routing, PersonalityEngine, TopicTuner, FineTuner
- src/utils/ — IndexedDB and storage layer
- src/contexts/ — Global app state

## Version
v1.0.0 — Polished prototype with local AI routing and 
full dashboard UI

## Author
Rithish Kannan J

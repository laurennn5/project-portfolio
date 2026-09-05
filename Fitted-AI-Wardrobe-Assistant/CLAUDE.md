# Fitted - AI Wardrobe Assistant

---

## Project Overview

**Fitted** is a mobile-first AI wardrobe assistant that helps users create outfit combinations. Think "Tinder for outfits"—users swipe through AI-generated outfit suggestions.

**Core Features:**
- Photo upload with automatic background removal (WASM client-side)
- AI-powered clothing categorization (GPT-4 Vision)
- Weather-aware outfit generation
- Swipe interface for outfit selection
- Local-first storage (IndexedDB + localStorage)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand (persisted) |
| Storage | IndexedDB + localStorage |
| Animation | Framer Motion |
| AI | OpenAI GPT-4 Vision API |
| Image Processing | @imgly/background-removal (WASM) |
| Deployment | Vercel |

---

## Key Conventions

### Code Style
- TypeScript strict mode—no `any` types
- Functional components with hooks
- Zustand for global state (see `src/store/useStore.ts`)
- Tailwind for styling (no CSS files)

### File Structure
```
src/
├── components/    # React components by feature
├── hooks/         # Custom React hooks
├── store/         # Zustand store
├── utils/         # Pure utility functions
├── services/      # API clients
├── types/         # TypeScript interfaces
└── api/           # Vercel serverless functions
```

### Patterns in Use
- **Strategy Pattern**: Image processors (Fast Crop vs ML Removal)
- **Web Workers**: Off-main-thread image processing
- **Factory Pattern**: Processor instantiation
- **Sliding Window**: Batch upload concurrency (3 parallel)

---

## Current Architecture Notes

### Image Processing
Two modes available via Strategy Pattern:
1. **Fast Mode** (<500ms): Smart crop, no ML
2. **Quality Mode** (2-5s): Full ML background removal

Both run in Web Workers to prevent UI freeze.

### State Management
- `processingMode`: User's preferred image processing mode
- `batchQueue`: Global upload queue (persists across navigation)
- `weatherData`: Cached weather (30-min TTL)

### API Routes (Vercel Serverless)
- `POST /api/analyze-clothing` - GPT-4 Vision analysis
- `POST /api/recommend-outfits` - AI outfit generation
- `GET /api/weather` - Weather data proxy

---

## Development Commands

```bash
npm run dev       # Start dev server (localhost:5174)
npm run build     # Production build + type check
npm run lint      # ESLint
npm run preview   # Preview production build
```

---

## Environment Variables

```bash
# .env.local (server-side only)
OPENAI_API_KEY=...
```

---

## Quick Reference

### UW Brand Colors
- Primary Purple: `#4b2e83`
- Gold Accent: `#b7a57a`

### Minimum Wardrobe
10 items required to unlock swipe mode:
- 5 tops, 3 bottoms, 2 shoes

### Image Constraints
- Max 1024px before processing (prevents mobile crashes)
- 512px + 60% quality for AI analysis
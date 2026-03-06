# Remmy

Remmy is a full-stack AI decision-coaching app designed to help users move from analysis paralysis to committed action.

The app runs a 9-stage decision workflow, uses an Express backend as a secure proxy to Anthropic, and a React frontend for the guided experience with gamification.

## Features

- Guided 9-stage decision workflow
- AI coaching with stage-aware prompts
- Gamification system (clarity points, levels, achievements, streaks)
- Persistent local progress via Zustand
- Input validation, rate limiting, CORS controls, and security headers
- PWA support (manifest + service worker)

## Tech Stack

- Frontend: React 19, Vite, Zustand, Axios
- Backend: Node.js, Express, Anthropic SDK
- Security: Helmet, CORS, express-rate-limit, express-validator

## Repository Structure

```text
.
|- backend/
|  |- src/
|  |  |- config/cors.js
|  |  |- middleware/security.js
|  |  |- routes/ai.js
|  |  |- server.js
|  |- test/cors-config.test.js
|  |- .env.example
|  |- package.json
|  |- Procfile
|- frontend/
|  |- public/
|  |  |- manifest.json
|  |  |- sw.js
|  |- src/
|  |  |- components/
|  |  |- pages/
|  |  |- services/
|  |  |- store/useRemmyStore.js
|  |- test/sanitize.test.js
|  |- .env
|  |- package.json
```

## Prerequisites

- Node.js 20+ recommended
- npm
- Anthropic API key

## Quick Start

1. Install dependencies.

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Configure environment variables.

Create backend env from the example:

```bash
cd backend
cp .env.example .env
```

Set `ANTHROPIC_API_KEY` in `backend/.env`.

Optional frontend env (`frontend/.env`):

```bash
VITE_API_URL=http://localhost:3001
```

3. Run backend and frontend in separate terminals.

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

4. Open `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

- `ANTHROPIC_API_KEY`: required; Anthropic API key
- `PORT`: backend port (default `3001`)
- `NODE_ENV`: `development` or `production`
- `ALLOWED_ORIGINS`: comma-separated exact origins
- `ALLOWED_ORIGIN_PATTERNS`: comma-separated regex patterns for allowed origins

Example:

```env
ANTHROPIC_API_KEY=your_real_key
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173,https://remmy-pi.vercel.app
ALLOWED_ORIGIN_PATTERNS=^https://remmy.*\.vercel\.app$
```

### Frontend (`frontend/.env`)

- `VITE_API_URL`: backend base URL (default fallback is `http://localhost:3001`)

## Available Scripts

### Backend

- `npm run dev`: run with nodemon
- `npm start`: run with node
- `npm test`: run backend unit tests

### Frontend

- `npm run dev`: run Vite dev server
- `npm run build`: build production bundle
- `npm run preview`: preview production build
- `npm run lint`: lint frontend code
- `npm test`: run frontend unit test for sanitize helper

## API

Base URL: `http://localhost:3001`

### Health Check

- `GET /health`
- Response: `{ "status": "ok" }`

### AI Chat

- `POST /api/ai/chat`
- Content-Type: `application/json`

Request body:

```json
{
  "message": "I cannot decide between A and B.",
  "stage": "intake",
  "context": {
    "decision": "Quit job or stay",
    "gutChoice": "Quit",
    "daysStuck": "1 month"
  }
}
```

Response body:

```json
{
  "reply": "...AI response..."
}
```

Validation and limits:

- `message`: required, max 2000 chars
- `stage`: required, must be one of the 9 valid stages
- `context`: optional object
- API limiter: 30 requests / 15 min / IP
- AI limiter: 10 requests / 15 min / IP

## Decision Flow

The app progresses through these stages:

1. `intake`
2. `narrowing`
3. `gut_check`
4. `resistance`
5. `anxiety_analysis`
6. `deadline`
7. `committed`
8. `implementation`
9. `checkin`

Each stage can send stage-specific context to backend AI prompting.

## Security Notes

- Never commit real keys to Git
- Keep `backend/.env` local only
- Backend enforces:
  - Helmet headers
  - Origin-restricted CORS
  - JSON body size limit (`10kb`)
  - Rate limits
  - Input validation

## Testing

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test
```

## Deployment Notes

- Frontend can be deployed to Vercel (configured origins already include Vercel URLs)
- Backend can run on any Node host (Procfile included)
- Ensure backend env vars are set in your deployment platform
- Set frontend `VITE_API_URL` to your deployed backend URL

## Troubleshooting

- `401/403` from AI route:
  - Check `ANTHROPIC_API_KEY`
- CORS errors:
  - Verify `ALLOWED_ORIGINS` and `ALLOWED_ORIGIN_PATTERNS`
- `429` responses:
  - You hit rate limits; wait and retry
- Frontend cannot reach backend:
  - Confirm backend is running on expected port
  - Confirm `VITE_API_URL` matches backend URL

## License

Current project license is `ISC` (see `backend/package.json`).

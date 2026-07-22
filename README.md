# 🌅 FindMySunset

FindMySunset is a full-stack web app for exploring sunrise and sunset times anywhere in the world. Click any point on an interactive map to see local sunrise/sunset times, discover a geographically distant city that shares similar solar patterns (via the Google Gemini API), and revisit past lookups on a dedicated history page.

**Live demo:** [find-my-sunset.vercel.app](https://find-my-sunset.vercel.app)

## Features

- **Interactive world map** built with React Leaflet — click anywhere to drop a marker
- **Sunrise/sunset calculation** for the clicked coordinates via `sunrise-sunset-js`
- **AI-powered location matching** — the Google Gemini API finds a well-known, geographically distant city with similar sunrise/sunset times and returns a short fun fact about it
- **Persistent history page** — every lookup (coordinates + Gemini's match) is saved to MongoDB and viewable on a separate page, with the ability to clear history
- Client/server split with the backend acting as a middleman between the frontend and the Gemini/MongoDB APIs

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router
- React Leaflet / Leaflet
- Tailwind CSS, styled-components

**Backend**
- Node.js + Express
- MongoDB (via the official Node driver)
- Google Gemini API (`@google/generative-ai`)
- `sunrise-sunset-js`

**Deployment**
- Frontend: Vercel
- Backend: Heroku

## Project Structure

```
workspace/
├── frontend/   # React + Vite app
└── backend/    # Express API (Gemini, MongoDB, sunrise/sunset routes)
```

## Local Setup

**Backend**
```bash
cd workspace/backend
npm install
```
Create a `.env` file with:
```
MONGO_URL=<your MongoDB connection string>
API_KEY=<your Google Gemini API key>
PORT=4000
```
```bash
npm run dev
```

**Frontend**
```bash
cd workspace/frontend
npm install
npm run dev
```

---

*Originally built as a technical assessment for Hack4Impact (2025-2026).*

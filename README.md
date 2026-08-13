# PaperPlane

A marketplace connecting YouTubers/influencers with verified creative
freelancers (video editors, thumbnail designers, graphic designers,
content writers, sound designers, motion/VFX). Built with plain
HTML/CSS/JS on the frontend and a Node.js + Express REST API on the
backend — no frameworks, matching the 24CAI0303 Back End Engineering
syllabus scope (Lectures 1–30: JS fundamentals, DOM, forms, Fetch API,
async/await, JSON; plus a hand-built Node/Express API layer).

## Project structure

```
paperplane/
├── backend/              Node.js + Express REST API
│   ├── server.js
│   ├── package.json
│   └── data/db.json      JSON-file "database" (freelancers, gigs, applications)
└── public/                Frontend (served by the backend, or opened directly)
    ├── index.html         Landing page
    ├── browse.html         Freelancer directory with filters
    ├── profile.html       Freelancer profile
    ├── gig.html            Gig detail + apply flow
    ├── post-gig.html       Post-a-gig form
    ├── dashboard.html      Creator/freelancer dashboard
    ├── css/style.css
    └── js/
        ├── data.js         Fetch-based API client + avatar hydration
        └── app.js          Nav, auth modal, toast, Smiley mascot generator
```

## Running it

```bash
cd backend
npm install
npm start
```

Then open **http://localhost:3000** — the backend serves the frontend
statically, so everything (API + site) runs from one process.

You can also open `public/index.html` directly in a browser; the
frontend detects it's running from `file://` and talks to
`http://localhost:3000/api` instead, as long as the backend is running
separately.

## What's backend vs. frontend

- **Backend (`/backend`)** — a small Express API with routes for
  freelancers, gigs, applications, and categories, backed by a JSON
  file (`data/db.json`) instead of a real database (no MongoDB yet —
  that's covered later in the course).
- **Frontend (`/public`)** — plain HTML/CSS/JS. `js/data.js` wraps
  `fetch()` calls to the API; `js/app.js` handles the sign-in modal
  (stored in `localStorage`, no real auth server), toasts, and the
  Smiley mascot SVG generator used throughout the design.

## Notes

- Sign-up is a lightweight name/email/role form — no password hashing
  or sessions, since that's beyond this checkpoint's scope.
- Freelancer avatars are fetched live from a public REST API
  (`randomuser.me`) via `fetch` + `async/await`, cached in
  `localStorage`, with a graceful fallback if the request fails.
- No real payments are processed anywhere in this prototype.

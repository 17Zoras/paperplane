/* ============================================================
   PAPERPLANE — Backend API
   Plain Node.js + Express, JSON-file storage (no database yet —
   this is the JS-only backend layer; swap readDB/writeDB for a
   real MongoDB/Mongoose layer later without touching the routes).
   ============================================================ */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR)); // serves the frontend at http://localhost:3000

// ---------- tiny JSON-file "database" ----------
function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}
function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- health check ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'paperplane-api' });
});

// ---------- freelancers ----------
app.get('/api/freelancers', (req, res) => {
  const db = readDB();
  res.json(db.freelancers);
});

app.get('/api/freelancers/:id', (req, res) => {
  const db = readDB();
  const freelancer = db.freelancers.find((f) => f.id === req.params.id);
  if (!freelancer) return res.status(404).json({ error: 'Freelancer not found' });
  res.json(freelancer);
});

// ---------- gigs ----------
app.get('/api/gigs', (req, res) => {
  const db = readDB();
  res.json(db.gigs);
});

app.get('/api/gigs/:id', (req, res) => {
  const db = readDB();
  const gig = db.gigs.find((g) => g.id === req.params.id);
  if (!gig) return res.status(404).json({ error: 'Gig not found' });
  res.json(gig);
});

app.post('/api/gigs', (req, res) => {
  const { title, category, budget, type, desc, creator } = req.body;
  if (!title || !category || !budget || !desc || !creator) {
    return res.status(400).json({ error: 'title, category, budget, desc, and creator are required' });
  }
  const db = readDB();
  const gig = {
    id: uid('g'),
    title,
    category,
    budget,
    type: type || 'One-off',
    desc,
    creator,
    posted: 'just now',
    status: 'open',
  };
  db.gigs.unshift(gig);
  writeDB(db);
  res.status(201).json(gig);
});

// ---------- applications ----------
app.get('/api/applications', (req, res) => {
  const db = readDB();
  res.json(db.applications);
});

app.post('/api/applications', (req, res) => {
  const { gigId, applicant, pitch } = req.body;
  if (!gigId || !applicant || !pitch) {
    return res.status(400).json({ error: 'gigId, applicant, and pitch are required' });
  }
  const db = readDB();
  const gig = db.gigs.find((g) => g.id === gigId);
  if (!gig) return res.status(404).json({ error: 'Gig not found' });

  const application = {
    id: uid('app'),
    gigId,
    gigTitle: gig.title,
    applicant,
    pitch,
    date: 'just now',
    status: 'pending',
  };
  db.applications.unshift(application);
  writeDB(db);
  res.status(201).json(application);
});

// ---------- categories (static reference list) ----------
app.get('/api/categories', (req, res) => {
  res.json([
    { id: 'editing', label: 'Video Editing', icon: '🎬' },
    { id: 'thumbnails', label: 'Thumbnail Design', icon: '🖼️' },
    { id: 'graphics', label: 'Graphic Design', icon: '🎨' },
    { id: 'writing', label: 'Content Writing', icon: '✍️' },
    { id: 'sound', label: 'Sound Design', icon: '🎧' },
    { id: 'motion', label: 'Motion Graphics', icon: '🌀' },
  ]);
});

// ---------- 404 for unknown API routes ----------
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`PaperPlane API running at http://localhost:${PORT}`);
  console.log(`Frontend served from ${PUBLIC_DIR}`);
});

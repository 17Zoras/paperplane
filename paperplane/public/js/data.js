/* ============================================================
   PAPERPLANE — data layer
   Freelancers, gigs, and applications now live behind a real
   Node.js + Express REST API (see /backend). This file is just
   a thin fetch() wrapper so the page scripts don't repeat
   fetch/JSON boilerplate everywhere.

   User "auth" stays in localStorage — this prototype doesn't
   implement real authentication, just a signed-in-name so the
   dashboard can tell gigs/applications apart per role.
   ============================================================ */

const PP = (() => {
  // If the page is opened as a plain file (file://), fall back to
  // localhost:3000 where `npm start` in /backend serves the API.
  // If served BY the backend itself, same-origin is used instead.
  const API_BASE = (location.protocol === 'file:' ? 'http://localhost:3000' : location.origin) + '/api';

  const KEYS = { user: 'pp_user' };
  const AVATAR_MAP_KEY = 'pp_avatar_map';

  const CATEGORIES = [
    { id: 'editing', label: 'Video Editing', icon: '🎬' },
    { id: 'thumbnails', label: 'Thumbnail Design', icon: '🖼️' },
    { id: 'graphics', label: 'Graphic Design', icon: '🎨' },
    { id: 'writing', label: 'Content Writing', icon: '✍️' },
    { id: 'sound', label: 'Sound Design', icon: '🎧' },
    { id: 'motion', label: 'Motion Graphics', icon: '🌀' },
  ];

  async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
      const e = new Error(`GET ${path} failed (${res.status})`);
      e.status = res.status;
      throw e;
    }
    return res.json();
  }

  async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `POST ${path} failed (${res.status})`);
    }
    return res.json();
  }

  /* ----------------------------------------------------------
     Second, unrelated REST call: live freelancer headshots from
     a public API, cached in localStorage so it only runs once.
     ---------------------------------------------------------- */
  async function fetchAvatarUrls(count) {
    const res = await fetch(`https://randomuser.me/api/?results=${count}&inc=picture&noinfo`);
    if (!res.ok) throw new Error(`Avatar API responded ${res.status}`);
    const json = await res.json();
    return json.results.map((r) => r.picture.medium);
  }

  async function getAvatarMap() {
    const cached = JSON.parse(localStorage.getItem(AVATAR_MAP_KEY) || 'null');
    if (cached) return cached;

    let map = {};
    try {
      const freelancers = await apiGet('/freelancers');
      const urls = await fetchAvatarUrls(freelancers.length);
      freelancers.forEach((f, i) => { map[f.id] = urls[i] || null; });
    } catch (err) {
      console.warn('PaperPlane: avatar fetch failed, using initials fallback.', err);
    }
    localStorage.setItem(AVATAR_MAP_KEY, JSON.stringify(map));
    return map;
  }

  return {
    CATEGORIES,
    API_BASE,

    // Freelancers
    getFreelancers: () => apiGet('/freelancers'),
    getFreelancer: (id) => apiGet(`/freelancers/${id}`),

    // Gigs
    getGigs: () => apiGet('/gigs'),
    getGig: (id) => apiGet(`/gigs/${id}`),
    addGig: (gig) => apiPost('/gigs', gig),

    // Applications
    getApplications: () => apiGet('/applications'),
    addApplication: (app) => apiPost('/applications', app),

    // Avatars (external API)
    getAvatarMap,

    // Local "session"
    getUser: () => JSON.parse(localStorage.getItem(KEYS.user) || 'null'),
    setUser: (u) => localStorage.setItem(KEYS.user, JSON.stringify(u)),
    logout: () => localStorage.removeItem(KEYS.user),

    categoryLabel: (id) => (CATEGORIES.find((c) => c.id === id) || {}).label || id,
    uid: (prefix) => prefix + '-' + Math.random().toString(36).slice(2, 8),
  };
})();

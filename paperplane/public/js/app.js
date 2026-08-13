/* ============================================================
   PAPERPLANE — shared app shell
   Handles the login/signup modal, nav auth state, and toasts.
   Include after data.js on every page.
   ============================================================ */

/* ============================================================
   Smiley mascot generator — same eye/mouth geometry as the
   reference design, rebuilt as a plain-JS HTML-string function
   instead of a React component.
   ============================================================ */
function ppEyePath(kind, x) {
  switch (kind) {
    case 'stars':
      return `<path d="M ${x} 22 l 5.3 10.8 11.9 1.7 -8.6 8.4 2 11.8 -10.6 -5.6 -10.6 5.6 2 -11.8 -8.6 -8.4 11.9 -1.7 Z" fill="currentColor"/>`;
    case 'hearts':
      return `<path d="M ${x} 52 c -14 -9 -18 -16 -18 -22 a 9 9 0 0 1 18 -4 a 9 9 0 0 1 18 4 c 0 6 -4 13 -18 22 Z" fill="currentColor"/>`;
    case 'arcs':
      return `<path d="M ${x-14} 46 a 14 14 0 0 1 28 0" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round"/>`;
    case 'squint':
      return `<g stroke="currentColor" stroke-width="11" stroke-linecap="round" fill="none"><path d="M ${x-14} 30 L ${x+12} 42"/><path d="M ${x-14} 52 L ${x+12} 42"/></g>`;
    default:
      return `<circle cx="${x}" cy="40" r="14" fill="currentColor"/>`;
  }
}

function ppSmiley({ eyes = 'dots', bg, fg, rounded = '', cls = '' }) {
  const left = (eyes === 'wink' || eyes === 'sparkle') ? 'dots' : eyes;
  const right = eyes === 'wink' ? 'squint' : (eyes === 'sparkle' ? 'sparkle' : eyes);

  const rightMark = right === 'sparkle'
    ? `<path d="M138 20 c 4 16 8 20 24 24 c -16 4 -20 8 -24 24 c -4 -16 -8 -20 -24 -24 c 16 -4 20 -8 24 -24 Z" fill="currentColor"/>`
    : right === 'squint'
      ? `<path d="M124 34 L 152 44 L 124 54" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`
      : ppEyePath(right, 138);

  return `<div class="smiley ${rounded} ${cls}" style="background-color:${bg}" aria-hidden="true">
    <svg viewBox="0 0 200 170" style="color:${fg}">
      ${ppEyePath(left, 62)}
      ${rightMark}
      <path d="M52 84 a48 48 0 0 0 96 0" fill="none" stroke="currentColor" stroke-width="34" stroke-linecap="round"/>
    </svg>
  </div>`;
}

// The paper-plane logo mark — unchanged shape, recolored to sit in a
// pop-card square so it matches the rest of the palette.
function ppLogoHTML(size = '') {
  return `<a href="index.html" class="logo">
    <span class="logo-mark">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
    </span>
    <span class="logo-word">PaperPlane</span>
  </a>`;
}

function ppToast(msg) {
  let el = document.getElementById('pp-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'pp-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function ppApiErrorHTML(err) {
  console.error('PaperPlane API error:', err);
  if (err && err.status === 404) {
    return `<div class="empty-state">
      <p class="eyebrow">Not found</p>
      <h3>This flight has already departed</h3>
      <p>We couldn't find that listing. It may have been removed.</p>
      <a href="index.html" class="btn btn-primary" style="margin-top:14px">Back to PaperPlane</a>
    </div>`;
  }
  return `<div class="empty-state">
    <p class="eyebrow">Can't reach the API</p>
    <h3>The backend isn't responding</h3>
    <p>Start it with <code>cd backend &amp;&amp; npm install &amp;&amp; npm start</code>, then reload this page.</p>
  </div>`;
}

function ppRenderNav() {
  const user = PP.getUser();
  const right = document.getElementById('nav-right');
  if (!right) return;
  if (user) {
    right.innerHTML = `
      <a href="dashboard.html" class="nav-user" title="Dashboard">
        <span class="mono">${user.role === 'creator' ? '👤' : '🛠️'} ${user.name.split(' ')[0]}</span>
      </a>
      <button class="btn btn-ghost btn-sm" id="logout-btn">Log out</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', () => {
      PP.logout();
      ppToast('Logged out');
      setTimeout(() => location.reload(), 500);
    });
  } else {
    right.innerHTML = `
      <button class="btn btn-ghost btn-sm" id="open-login">Log in</button>
      <button class="btn btn-primary btn-sm" id="open-signup">Join free</button>
    `;
    document.getElementById('open-login').addEventListener('click', () => ppOpenAuth('login'));
    document.getElementById('open-signup').addEventListener('click', () => ppOpenAuth('signup'));
  }
}

function ppOpenAuth(tab = 'login') {
  const backdrop = document.getElementById('auth-modal');
  if (!backdrop) return;
  backdrop.classList.add('open');
  ppSwitchAuthTab(tab);
}
function ppCloseAuth() {
  const backdrop = document.getElementById('auth-modal');
  if (backdrop) backdrop.classList.remove('open');
}
function ppSwitchAuthTab(tab) {
  document.querySelectorAll('.tab-switch button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.auth-pane').forEach(p => p.style.display = (p.dataset.pane === tab ? 'block' : 'none'));
}

function ppInjectAuthModal() {
  if (document.getElementById('auth-modal')) return;
  const div = document.createElement('div');
  div.className = 'modal-backdrop';
  div.id = 'auth-modal';
  div.innerHTML = `
    <div class="modal pop-card-lg" style="background:var(--pp-white)">
      <button class="modal-close" onclick="ppCloseAuth()">&times;</button>
      <div class="tab-switch">
        <button data-tab="login" class="active" onclick="ppSwitchAuthTab('login')">Log in</button>
        <button data-tab="signup" onclick="ppSwitchAuthTab('signup')">Sign up</button>
      </div>
      <div class="auth-pane" data-pane="login">
        <form id="login-form">
          <div class="field"><label>Email</label><input type="email" required placeholder="you@studio.com"></div>
          <div class="field"><label>Password</label><input type="password" required placeholder="••••••••"></div>
          <button class="btn btn-primary btn-block" type="submit">Board your flight</button>
        </form>
      </div>
      <div class="auth-pane" data-pane="signup" style="display:none">
        <form id="signup-form">
          <div class="field"><label>Name</label><input type="text" required placeholder="Your name"></div>
          <div class="field"><label>Email</label><input type="email" required placeholder="you@studio.com"></div>
          <div class="field">
            <label>I'm joining as</label>
            <div class="chip-select" id="signup-role">
              <div class="chip-opt active" data-role="creator">Creator / Brand</div>
              <div class="chip-opt" data-role="freelancer">Freelancer</div>
            </div>
          </div>
          <button class="btn btn-primary btn-block" type="submit">Create account</button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(div);

  div.addEventListener('click', (e) => { if (e.target === div) ppCloseAuth(); });

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type=email]').value;
    const existing = PP.getUser();
    PP.setUser({ name: existing?.name || email.split('@')[0], email, role: existing?.role || 'creator' });
    ppToast('Welcome back!');
    ppCloseAuth();
    setTimeout(() => location.reload(), 400);
  });

  const roleChips = div.querySelectorAll('#signup-role .chip-opt');
  roleChips.forEach(c => c.addEventListener('click', () => {
    roleChips.forEach(x => x.classList.remove('active'));
    c.classList.add('active');
  }));

  document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = e.target.querySelectorAll('input');
    const role = div.querySelector('#signup-role .active').dataset.role;
    PP.setUser({ name: inputs[0].value, email: inputs[1].value, role });
    ppToast('Account created — welcome to PaperPlane');
    ppCloseAuth();
    setTimeout(() => location.reload(), 400);
  });
}

function ppRequireAuthOr(role, then) {
  const user = PP.getUser();
  if (!user) { ppOpenAuth('signup'); return; }
  then(user);
}

document.addEventListener('DOMContentLoaded', () => {
  ppInjectAuthModal();
  ppRenderNav();
});

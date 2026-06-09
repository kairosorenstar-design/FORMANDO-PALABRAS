/* ═══════════════════════════════════════════════
   MAIN — App State · UI Helpers · Init
   js/main.js
═══════════════════════════════════════════════ */

/* ── App state ──────────────────────────────── */
let _currentUser = null;

function setCurrentUser(user) {
  _currentUser = user;
  localStorage.setItem('fp_user', JSON.stringify(user));
}

function getCurrentUser() {
  return _currentUser;
}

/* ── UI helpers ─────────────────────────────── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function showLoader(v) {
  document.getElementById('loader').classList.toggle('hidden', !v);
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => (t.className = 'toast'), 3200);
}

/* ── Copy buttons ───────────────────────────── */
function setupCopy(btnId, fieldId) {
  const btn   = document.getElementById(btnId);
  const field = document.getElementById(fieldId);
  const doCopy = () => {
    const val = field.getAttribute('data-val') || field.textContent;
    navigator.clipboard.writeText(val).then(() => {
      btn.textContent = '¡Copiado!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copiar';
        btn.classList.remove('copied');
      }, 2000);
    });
  };
  btn.addEventListener('click', doCopy);
  field.addEventListener('click', doCopy);
}

/* ── Main page population ───────────────────── */
async function enterMain() {
  const user = getCurrentUser();

  // Username
  document.getElementById('display-username').textContent = user.display_name;

  // Referral
  const link = `${SITE_URL}?ref=${user.referral_code}`;
  const lEl  = document.getElementById('ref-link');
  lEl.textContent = link;
  lEl.setAttribute('data-val', link);

  const cEl = document.getElementById('ref-code');
  cEl.textContent = user.referral_code;
  cEl.setAttribute('data-val', user.referral_code);

  // Random letters on boxes
  setRandomLetters();

  // Load async data
  await Promise.all([refreshReferralCount(), loadWordsHistory()]);

  // Realtime subscription
  dbSubscribeWords(word => addWordChip(word, true));

  showPage('page-main');
  showLoader(false);
}

/* ── Referral count ─────────────────────────── */
async function refreshReferralCount() {
  const user = getCurrentUser();
  if (!user) return;
  const n = await dbGetReferralCount(user.id);
  document.getElementById('referral-count-num').textContent = n;
  document.getElementById('stat-referral-big').textContent  = n;
}

/* ── Words history ──────────────────────────── */
async function loadWordsHistory() {
  const words = await dbGetWordsHistory();
  const grid  = document.getElementById('words-grid');

  if (words.length === 0) {
    grid.innerHTML = '<span class="words-empty">Aún no hay combinaciones registradas.</span>';
    updateWordsCount(0);
    return;
  }

  grid.innerHTML = '';
  words.forEach(w => addWordChip(w, false));
}

function addWordChip(word, isNew) {
  const grid  = document.getElementById('words-grid');
  const empty = grid.querySelector('.words-empty');
  if (empty) empty.remove();
  if (grid.querySelector(`[data-word="${word}"]`)) return;

  const chip = document.createElement('div');
  chip.className  = 'word-chip' + (isNew ? ' new-word' : '');
  chip.dataset.word = word;
  chip.textContent  = word;
  grid.prepend(chip);

  if (isNew) setTimeout(() => chip.classList.remove('new-word'), 600);
  updateWordsCount(grid.querySelectorAll('.word-chip').length);
}

function updateWordsCount(n) {
  document.getElementById('words-count-badge').textContent = `${n} formadas`;
}

/* ── Referral param on load ─────────────────── */
function checkRefParam() {
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref) {
    sessionStorage.setItem('fp_ref', ref);
    history.replaceState(null, '', window.location.origin + window.location.pathname);
  }
}

/* ── Init ───────────────────────────────────── */
async function init() {
  showLoader(true);
  checkRefParam();

  try {
    const saved = localStorage.getItem('fp_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      const user   = await dbGetUserById(parsed.id);
      if (user) {
        setCurrentUser(user);
        await enterMain();
        return;
      }
      localStorage.removeItem('fp_user');
    }
  } catch {
    localStorage.removeItem('fp_user');
  }

  showLoader(false);
  showPage('page-auth');
}

/* ── Button events ──────────────────────────── */
document.getElementById('btn-form-word').addEventListener('click', () => {
  if (!getCurrentUser()) return;
  if (isSpinning) { showToast('Espera a que termine la animación.'); return; }
  startWaitFlow();
});

setupCopy('btn-copy-link', 'ref-link');
setupCopy('btn-copy-code', 'ref-code');

/* ── Start ──────────────────────────────────── */
init();

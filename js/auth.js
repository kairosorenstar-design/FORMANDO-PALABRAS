/* ═══════════════════════════════════════════════
   AUTH — Login / Register Tab Logic
   js/auth.js
═══════════════════════════════════════════════ */

/* ── Tab switcher with slide animation ──────── */
(function initTabs() {
  const tabLogin    = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const indicator   = document.getElementById('tab-indicator');
  const track       = document.getElementById('auth-track');
  const wrapper     = track.parentElement; // .auth-panels-wrapper

  let currentTab = 0; // 0 = login, 1 = register

  function measurePanelHeight(index) {
    const panels = track.querySelectorAll('.auth-panel');
    return panels[index].scrollHeight;
  }

  function positionIndicator(tab) {
    indicator.style.left  = (tab.offsetLeft + 8) + 'px';
    indicator.style.width = (tab.offsetWidth - 16) + 'px';
  }

  function switchTo(index) {
    if (index === currentTab) return;
    currentTab = index;

    // Move track
    track.style.transform = `translateX(-${index * 100}%)`;

    // Animate wrapper height to new panel's height
    wrapper.style.height = measurePanelHeight(index) + 'px';

    // Tab active states
    tabLogin.classList.toggle('active',    index === 0);
    tabRegister.classList.toggle('active', index === 1);
    tabLogin.setAttribute('aria-selected',    index === 0);
    tabRegister.setAttribute('aria-selected', index === 1);

    // Move indicator
    positionIndicator(index === 0 ? tabLogin : tabRegister);

    // Clear errors when switching
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
  }

  // Initialize on load (after fonts settle)
  function init() {
    // Set initial wrapper height
    wrapper.style.height = measurePanelHeight(0) + 'px';
    positionIndicator(tabLogin);
  }

  tabLogin.addEventListener('click',    () => switchTo(0));
  tabRegister.addEventListener('click', () => switchTo(1));

  // Re-measure on window resize
  window.addEventListener('resize', () => {
    wrapper.style.height = measurePanelHeight(currentTab) + 'px';
    positionIndicator(currentTab === 0 ? tabLogin : tabRegister);
  });

  // Run after page render
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();

/* ── Login handler ──────────────────────────── */
async function handleLogin() {
  const emailInput = document.getElementById('login-email');
  const email      = emailInput.value.trim();
  const btn        = document.getElementById('btn-login');

  // Validate
  const emailOk = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  document.getElementById('login-email-error').classList.toggle('show', !emailOk);
  if (!emailOk) return;

  btn.disabled = true;
  btn.textContent = 'Buscando...';

  try {
    const user = await dbGetUserByEmail(email);

    if (!user) {
      const errEl = document.getElementById('login-error');
      errEl.textContent = 'No encontramos una cuenta con ese correo. ¿Quieres registrarte?';
      errEl.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Entrar';
      return;
    }

    // Found — enter main
    setCurrentUser(user);
    enterMain();

  } catch (e) {
    const errEl = document.getElementById('login-error');
    errEl.textContent = 'Error al buscar tu cuenta. Intenta de nuevo.';
    errEl.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

/* ── Register handler ───────────────────────── */
async function handleRegister() {
  const email = document.getElementById('reg-email').value.trim();
  const name  = document.getElementById('reg-name').value.trim();
  const btn   = document.getElementById('btn-register');

  // Validate
  const emailOk = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  document.getElementById('reg-email-error').classList.toggle('show', !emailOk);
  const nameOk = !!name;
  document.getElementById('reg-name-error').classList.toggle('show', !nameOk);
  if (!emailOk || !nameOk) return;

  btn.disabled = true;
  btn.textContent = 'Creando cuenta...';

  try {
    // Check if email already exists
    const existing = await dbGetUserByEmail(email);
    if (existing) {
      const errEl = document.getElementById('register-error');
      errEl.textContent = 'Este correo ya tiene una cuenta. Usa "Iniciar sesión".';
      errEl.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Crear cuenta';
      return;
    }

    const refCode = sessionStorage.getItem('fp_ref') || null;
    const user    = await dbCreateUser(email, name, refCode);
    sessionStorage.removeItem('fp_ref');

    setCurrentUser(user);
    enterMain();

  } catch (e) {
    const errEl = document.getElementById('register-error');
    errEl.textContent = 'Error al crear la cuenta. Intenta de nuevo.';
    errEl.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'Crear cuenta';
  }
}

/* ── Event listeners ────────────────────────── */
document.getElementById('btn-login').addEventListener('click', handleLogin);
document.getElementById('btn-register').addEventListener('click', handleRegister);

document.getElementById('login-email').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLogin();
});
document.getElementById('reg-email').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('reg-name').focus();
});
document.getElementById('reg-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleRegister();
});

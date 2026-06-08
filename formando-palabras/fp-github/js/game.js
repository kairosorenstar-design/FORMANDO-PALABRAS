/* ═══════════════════════════════════════════════
   GAME — Wait Flow · Countdown · Reveal
   js/game.js
═══════════════════════════════════════════════ */

let waitTimer   = null;
let pendingWord = null;
let isSpinning  = false;

/* ── Helpers ────────────────────────────────── */
function randomLetter() {
  return LETTERS[Math.floor(Math.random() * 26)];
}

function generateWord() {
  return [0, 1, 2, 3].map(() => randomLetter()).join('');
}

function setRandomLetters() {
  for (let i = 0; i < 4; i++) {
    document.getElementById(`box-${i}`).textContent = randomLetter();
  }
}

/* ── Step dots builder ──────────────────────── */
function buildStepDots(active) {
  const wrap = document.getElementById('wait-steps');
  wrap.innerHTML = '';
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.createElement('div');
    dot.className = 'wait-step-dot' +
      (i < active ? ' done' : i === active ? ' active' : '');
    wrap.appendChild(dot);

    if (i < TOTAL_STEPS) {
      const line = document.createElement('div');
      line.className = 'wait-step-line' + (i < active ? ' done' : '');
      wrap.appendChild(line);
    }
  }
}

/* ── Wait flow ──────────────────────────────── */
function startWaitFlow() {
  pendingWord = generateWord();
  showWaitStep(1);
}

function showWaitStep(step) {
  showPage('page-wait');
  buildStepDots(step);

  document.getElementById('wait-step-label').textContent = `Paso ${step} de ${TOTAL_STEPS}`;
  document.getElementById('wait-status').textContent =
    step < TOTAL_STEPS ? 'procesando · por favor espera' : 'finalizando · casi listo';

  startCountdown(STEP_SECS, () => {
    if (step < TOTAL_STEPS) {
      showWaitStep(step + 1);
    } else {
      showPage('page-main');
      revealWord(pendingWord);
    }
  });
}

/* ── Countdown timer ────────────────────────── */
function startCountdown(secs, onDone) {
  let rem = secs;

  const numEl  = document.getElementById('ring-num');
  const ringEl = document.getElementById('ring-fill');
  const barEl  = document.getElementById('wait-bar-fill');
  const C      = 2 * Math.PI * 80; // circumference r=80 → ≈502.65

  // Reset without transition
  numEl.textContent = rem;
  ringEl.style.transition = 'none';
  ringEl.style.strokeDashoffset = '0';
  barEl.style.transition = 'none';
  barEl.style.width = '0%';

  if (waitTimer) clearInterval(waitTimer);

  // Apply transition after paint
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ringEl.style.transition = `stroke-dashoffset ${secs}s linear`;
    ringEl.style.strokeDashoffset = C;
    barEl.style.transition = `width ${secs}s linear`;
    barEl.style.width = '100%';
  }));

  waitTimer = setInterval(() => {
    rem--;
    numEl.textContent = rem;
    if (rem <= 0) {
      clearInterval(waitTimer);
      onDone();
    }
  }, 1000);
}

/* ── Reveal animation ───────────────────────── */
async function revealWord(word) {
  if (isSpinning) return;
  isSpinning = true;

  const boxes = [0, 1, 2, 3].map(i => document.getElementById(`box-${i}`));

  // Spin all boxes
  boxes.forEach(b => {
    b.textContent = randomLetter();
    b.classList.add('spinning');
  });

  // Rapid random cycling
  let n = 0;
  const si = setInterval(() => {
    boxes.forEach(b => b.textContent = randomLetter());
    if (++n > 28) {
      clearInterval(si);
      boxes.forEach(b => b.classList.remove('spinning'));
      revealStaggered(boxes, word.split(''));
    }
  }, 75);
}

async function revealStaggered(boxes, letters) {
  for (let i = 0; i < 4; i++) {
    await new Promise(r => setTimeout(r, 210));
    boxes[i].textContent = letters[i];
    boxes[i].classList.add('reveal');
    setTimeout(() => boxes[i].classList.remove('reveal'), 600);
  }

  // Save to DB
  showLoader(true);
  try {
    const saved = await dbSaveWord(pendingWord, getCurrentUser().id);
    if (saved) {
      showToast(`¡Combinación "${pendingWord}" guardada!`, 'success');
      refreshReferralCount();
    } else {
      showToast('Esta combinación ya fue formada antes.', 'error');
    }
  } catch {
    showToast('Error guardando la combinación.', 'error');
  }
  showLoader(false);

  isSpinning  = false;
  pendingWord = null;
}

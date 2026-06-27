/* ═══════════════════════════════════════════════
   CONFIG — Supabase & App Constants
   js/config.js
═══════════════════════════════════════════════ */

const SUPABASE_URL      = 'https://eausjiiqmajhgqthvsyd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhdXNqaWlxbWFqaGdxdGh2c3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNjA1ODgsImV4cCI6MjA5NTkzNjU4OH0.5O2sR1uEdJhEng7YtAwlU9gQOKMCJLpJgD0yv9689tE';

// Corregido para GitHub Pages con subcarpeta /FORMANDO-PALABRAS/
const SITE_URL = 'https://kairosorenstar-design.github.io/FORMANDO-PALABRAS';

// Game constants
const LETTERS     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const TOTAL_STEPS = 5;
const STEP_SECS   = 11;

// Supabase client
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

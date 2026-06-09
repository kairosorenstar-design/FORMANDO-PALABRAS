/* ═══════════════════════════════════════════════
   DB — Supabase Database Operations
   js/db.js
═══════════════════════════════════════════════ */

/**
 * Busca un usuario por email.
 * @returns {object|null}
 */
async function dbGetUserByEmail(email) {
  const { data } = await sb
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  return data;
}

/**
 * Busca un usuario por ID.
 * @returns {object|null}
 */
async function dbGetUserById(id) {
  const { data, error } = await sb
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

/**
 * Crea un nuevo usuario.
 * Genera un código de referido único.
 * @returns {object} usuario creado
 */
async function dbCreateUser(email, displayName, referredBy) {
  // Generar código único
  let code;
  let exists = true;
  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data } = await sb.from('users').select('id').eq('referral_code', code).maybeSingle();
    exists = !!data;
  }

  const { data, error } = await sb
    .from('users')
    .insert({
      email:         email.toLowerCase().trim(),
      display_name:  displayName.trim(),
      referral_code: code,
      referred_by:   referredBy || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Sumar referido al referidor
  if (referredBy) {
    await sb.rpc('increment_referrals', { p_code: referredBy });
  }

  return data;
}

/**
 * Obtiene el conteo de referidos de un usuario.
 * @returns {number}
 */
async function dbGetReferralCount(userId) {
  const { data } = await sb
    .from('users')
    .select('referral_count')
    .eq('id', userId)
    .single();
  return data?.referral_count ?? 0;
}

/**
 * Carga el historial global de combinaciones.
 * @returns {string[]} array de combinaciones
 */
async function dbGetWordsHistory() {
  const { data } = await sb
    .from('words')
    .select('combination')
    .order('created_at', { ascending: false })
    .limit(80);
  return data ? data.map(w => w.combination) : [];
}

/**
 * Intenta guardar una combinación nueva.
 * @returns {boolean} true si se guardó, false si ya existía
 */
async function dbSaveWord(combination, userId) {
  // Verificar unicidad
  const { data: exists } = await sb
    .from('words')
    .select('id')
    .eq('combination', combination)
    .maybeSingle();

  if (exists) return false;

  const { error } = await sb
    .from('words')
    .insert({ combination, user_id: userId });

  if (error) throw error;
  return true;
}

/**
 * Suscripción en tiempo real a nuevas palabras.
 * @param {function} onNew - callback(combination: string)
 */
function dbSubscribeWords(onNew) {
  sb.channel('words-live')
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'words'
    }, payload => {
      onNew(payload.new.combination);
    })
    .subscribe();
}

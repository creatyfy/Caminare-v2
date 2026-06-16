import { supabase } from './supabase';

export interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  is_admin?: boolean | null;
}

export interface HomeStats {
  totalEmotions: number;
  totalPatterns: number;
  activeDays: number;
  totalEntries: number;
}

export interface EmotionRow {
  id: string;
  name: string;
  validation: 'pending' | 'confirmed' | 'edited' | 'rejected' | 'ignored';
}

export interface EntryWithEmotions {
  id: string;
  raw_text: string;
  processed_text: string | null;
  created_at: string;
  input_type: 'text' | 'audio';
  processing_status: 'pending' | 'processing' | 'done' | 'failed';
  emotions: EmotionRow[];
}

export interface EntryDetail extends EntryWithEmotions {
  parsed_thoughts: string[];
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    // Busca na tabela profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, is_admin')
      .eq('id', userId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) console.error('[db.getProfile]', error);

    // Se tem nome na tabela profiles, usa ele
    if (data?.full_name) return data;

    // Fallback: busca o nome nos metadados do auth (raw_user_meta_data)
    const { data: userData } = await supabase.auth.getUser();
    const metaName = userData?.user?.user_metadata?.full_name as string | undefined;

    return {
      full_name: metaName ?? data?.full_name ?? null,
      avatar_url: data?.avatar_url ?? null,
      is_admin: data?.is_admin ?? false,
    };
  } catch (err) {
    console.error('[db.getProfile]', err);
    return null;
  }
}

export async function deleteAccount(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.rpc('delete_my_account');
    if (error) {
      console.error('[db.deleteAccount]', error);
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    console.error('[db.deleteAccount]', err);
    return { error: 'Erro ao excluir a conta.' };
  }
}

// Envia uma sugestão do usuário (canal de sugestões dentro do app)
export async function submitFeedback(
  userId: string,
  message: string
): Promise<{ error: string | null }> {
  try {
    const trimmed = message.trim();
    if (!trimmed) return { error: 'empty' };
    const { error } = await supabase
      .from('feedback')
      .insert({ user_id: userId, message: trimmed });
    if (error) {
      console.error('[db.submitFeedback]', error);
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    console.error('[db.submitFeedback]', err);
    return { error: 'Erro ao enviar a sugestão.' };
  }
}

export async function getHomeStats(userId: string): Promise<HomeStats | null> {
  try {
    const [emotionsRes, patternsRes, entriesRes, datesRes] = await Promise.all([
      supabase
        .from('emotions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('validation', 'rejected'),
      supabase
        .from('patterns')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null),
      supabase
        .from('entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null),
      supabase
        .from('entries')
        .select('created_at')
        .eq('user_id', userId)
        .is('deleted_at', null),
    ]);

    if (emotionsRes.error) console.error('[db.getHomeStats emotions]', emotionsRes.error);
    if (patternsRes.error) console.error('[db.getHomeStats patterns]', patternsRes.error);
    if (entriesRes.error) console.error('[db.getHomeStats entries]', entriesRes.error);
    if (datesRes.error) console.error('[db.getHomeStats dates]', datesRes.error);

    const uniqueDays = new Set(
      (datesRes.data ?? []).map((r: { created_at: string }) =>
        new Date(r.created_at).toISOString().slice(0, 10)
      )
    );

    return {
      totalEmotions: emotionsRes.count ?? 0,
      totalPatterns: patternsRes.count ?? 0,
      activeDays: uniqueDays.size,
      totalEntries: entriesRes.count ?? 0,
    };
  } catch (err) {
    console.error('[db.getHomeStats]', err);
    return null;
  }
}

type EntryRow = {
  id: string;
  raw_text: string;
  processed_text: string | null;
  created_at: string;
  input_type: 'text' | 'audio';
  processing_status: 'pending' | 'processing' | 'done' | 'failed';
  emotions: EmotionRow[] | null;
};

function mapEntryRow(row: EntryRow): EntryWithEmotions {
  return {
    id: row.id,
    raw_text: row.raw_text,
    processed_text: row.processed_text,
    created_at: row.created_at,
    input_type: row.input_type,
    processing_status: row.processing_status,
    emotions: (row.emotions ?? []).filter((e) => e.validation === 'confirmed'),
  };
}

export async function getEntries(
  userId: string,
  filter: '7days' | '15days' | '30days' | 'all' = 'all'
): Promise<EntryWithEmotions[] | null> {
  try {
    let query = supabase
      .from('entries')
      .select(
        'id, raw_text, processed_text, created_at, input_type, processing_status, emotions(id, name, validation)'
      )
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      const days = filter === '7days' ? 7 : filter === '15days' ? 15 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', since);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[db.getEntries]', error);
      return null;
    }
    return (data as EntryRow[]).map(mapEntryRow);
  } catch (err) {
    console.error('[db.getEntries]', err);
    return null;
  }
}

export async function getEntryById(
  userId: string,
  entryId: string
): Promise<EntryDetail | null> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select(
        'id, raw_text, processed_text, created_at, input_type, processing_status, emotions(id, name, validation)'
      )
      .eq('user_id', userId)
      .eq('id', entryId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('[db.getEntryById]', error);
      return null;
    }
    if (!data) return null;

    const { data: logRow, error: logErr } = await supabase
      .from('entry_analysis_logs')
      .select('parsed_thoughts')
      .eq('user_id', userId)
      .eq('entry_id', entryId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (logErr) console.error('[db.getEntryById log]', logErr);

    const thoughts = parseThoughts(logRow?.parsed_thoughts);
    return { ...mapEntryRow(data as EntryRow), parsed_thoughts: thoughts };
  } catch (err) {
    console.error('[db.getEntryById]', err);
    return null;
  }
}

function parseThoughts(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;
          if (typeof obj.content === 'string') return obj.content;
          if (typeof obj.text === 'string') return obj.text;
          if (typeof obj.thought === 'string') return obj.thought;
        }
        return null;
      })
      .filter((v): v is string => typeof v === 'string' && v.length > 0);
  }
  return [];
}

// ── Entry validation: emotions + thoughts ──────────────────────────────────

export interface EmotionFull {
  id: string;
  name: string;
  name_original: string;
  validation: 'pending' | 'confirmed' | 'edited' | 'rejected' | 'ignored';
  // enum emotion_intensity no banco: 'subtle' | 'moderate' | 'strong' | 'very_strong'
  intensity: 'subtle' | 'moderate' | 'strong' | 'very_strong' | null;
}

export async function getEntryEmotions(
  userId: string,
  entryId: string
): Promise<EmotionFull[]> {
  try {
    const { data, error } = await supabase
      .from('emotions')
      .select('id, name, name_original, validation, intensity')
      .eq('user_id', userId)
      .eq('entry_id', entryId)
      .neq('validation', 'rejected')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('[db.getEntryEmotions]', error);
      return [];
    }
    return (data ?? []) as EmotionFull[];
  } catch (err) {
    console.error('[db.getEntryEmotions]', err);
    return [];
  }
}

export async function addEntryEmotion(
  userId: string,
  entryId: string,
  name: string
): Promise<EmotionFull | null> {
  try {
    const trimmed = name.trim();
    if (!trimmed) return null;
    // source='manual': distingue do que a IA sugeriu (treino). Resiliente: se a
    // coluna `source` ainda não existir (migration não aplicada), reinsere sem
    // ela (42703 = undefined_column).
    const base = {
      user_id: userId,
      entry_id: entryId,
      name: trimmed,
      name_original: trimmed,
      validation: 'confirmed' as const,
    };
    const cols = 'id, name, name_original, validation, intensity';
    let { data, error } = await supabase
      .from('emotions')
      .insert({ ...base, source: 'manual' })
      .select(cols)
      .single();
    if (error?.code === '42703') {
      ({ data, error } = await supabase.from('emotions').insert(base).select(cols).single());
    }
    if (error) {
      console.error('[db.addEntryEmotion]', error);
      return null;
    }
    return data as EmotionFull;
  } catch (err) {
    console.error('[db.addEntryEmotion]', err);
    return null;
  }
}

export async function setEmotionValidation(
  emotionId: string,
  validation: 'confirmed' | 'edited' | 'rejected'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('emotions')
      .update({ validation })
      .eq('id', emotionId);
    if (error) {
      console.error('[db.setEmotionValidation]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[db.setEmotionValidation]', err);
    return false;
  }
}

// Marca como 'ignored' as emoções sugeridas pela IA que continuaram 'pending'
// ao avançar (não confirmadas nem rejeitadas). Assim todo item termina com um
// status final (confirmed | edited | rejected | ignored) — nada fica 'pending'
// nem se perde. Resiliente: se o enum ainda não tiver 'ignored' (migration não
// aplicada), apenas não persiste (não quebra o fluxo).
export async function ignorePendingEmotions(
  userId: string,
  entryId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('emotions')
      .update({ validation: 'ignored' })
      .eq('user_id', userId)
      .eq('entry_id', entryId)
      .eq('validation', 'pending');
    if (error) {
      if (SCHEMA_MISMATCH_CODES.has(error.code)) {
        console.warn('[db.ignorePendingEmotions] enum sem valor "ignored" ainda (migration pendente).');
        return false;
      }
      console.error('[db.ignorePendingEmotions]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[db.ignorePendingEmotions]', err);
    return false;
  }
}

// Exclusão de registro = soft delete (deleted_at). Não chama /api/*.
// Filtra por dono e confere as linhas afetadas: se o RLS bloquear o UPDATE,
// o Supabase retorna sucesso com 0 linhas — então retornamos false para a UI
// não remover algo que não foi gravado ("falso sucesso").
export async function deleteEntry(userId: string, entryId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', entryId)
      .eq('user_id', userId)
      .select('id');
    if (error) {
      console.error('[db.deleteEntry]', error);
      return false;
    }
    return (data?.length ?? 0) > 0;
  } catch (err) {
    console.error('[db.deleteEntry]', err);
    return false;
  }
}

// Edita o texto do registro (raw_text). Edição direta no banco, sem IA.
export async function updateEntry(
  entryId: string,
  rawText: string
): Promise<boolean> {
  try {
    const trimmed = rawText.trim();
    if (!trimmed) return false;
    const { data, error } = await supabase
      .from('entries')
      .update({ raw_text: trimmed })
      .eq('id', entryId)
      .select('id');
    if (error) {
      console.error('[db.updateEntry]', error);
      return false;
    }
    if ((data?.length ?? 0) === 0) {
      console.error('[db.updateEntry] UPDATE afetou 0 linhas (provável RLS sem policy de UPDATE em entries).');
      return false;
    }
    return true;
  } catch (err) {
    console.error('[db.updateEntry]', err);
    return false;
  }
}

// Renomeia uma emoção do registro sem chamar IA (mesma resiliência de schema do
// updateBelief: garante o name salvo mesmo sem version/enum 'edited').
export async function updateEntryEmotion(
  emotionId: string,
  name: string
): Promise<boolean> {
  return updateRowResilient('emotions', emotionId, name, 'name', '[db.updateEntryEmotion]');
}

// Status de processamento de IA do registro (usado para decidir se chamamos
// /api/process-entry ou se a análise já foi feita).
export async function getEntryProcessingStatus(
  userId: string,
  entryId: string
): Promise<'pending' | 'processing' | 'done' | 'failed' | null> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('processing_status')
      .eq('user_id', userId)
      .eq('id', entryId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      console.error('[db.getEntryProcessingStatus]', error);
      return null;
    }
    return (data?.processing_status as 'pending' | 'processing' | 'done' | 'failed') ?? null;
  } catch (err) {
    console.error('[db.getEntryProcessingStatus]', err);
    return null;
  }
}

export async function getEntryThoughts(
  userId: string,
  entryId: string
): Promise<string[] | null> {
  try {
    const { data, error } = await supabase
      .from('entry_analysis_logs')
      .select('parsed_thoughts')
      .eq('user_id', userId)
      .eq('entry_id', entryId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('[db.getEntryThoughts]', error);
      return null;
    }
    if (!data) return null;
    return parseThoughts(data.parsed_thoughts);
  } catch (err) {
    console.error('[db.getEntryThoughts]', err);
    return null;
  }
}

// ── Beliefs ────────────────────────────────────────────────────────────────

export interface BeliefFull {
  id: string;
  content: string;
  content_original: string;
  validation: 'pending' | 'confirmed' | 'edited' | 'rejected' | 'ignored';
  occurrence_count: number;
}

// Crenças pendentes de validação. Mostra APENAS validation = 'pending' — crenças
// já confirmadas/descartadas/ajustadas de registros anteriores não reaparecem.
export async function getUserBeliefs(userId: string): Promise<BeliefFull[]> {
  try {
    const { data, error } = await supabase
      .from('beliefs')
      .select('id, content, content_original, validation, occurrence_count')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .eq('validation', 'pending')
      .order('occurrence_count', { ascending: false });
    if (error) {
      console.error('[db.getUserBeliefs]', error);
      return [];
    }
    return (data ?? []) as BeliefFull[];
  } catch (err) {
    console.error('[db.getUserBeliefs]', err);
    return [];
  }
}

// Crenças pendentes GERADAS por um registro específico (source_entry_id). Usada
// na tela de validação logo após o registro: mostra só as crenças daquele
// registro, no máximo 5. Crenças avulsas (source_entry_id null) não entram.
export async function getEntryBeliefs(
  userId: string,
  entryId: string
): Promise<BeliefFull[]> {
  try {
    const { data, error } = await supabase
      .from('beliefs')
      .select('id, content, content_original, validation, occurrence_count')
      .eq('user_id', userId)
      .eq('source_entry_id', entryId)
      .is('deleted_at', null)
      .eq('validation', 'pending')
      .order('occurrence_count', { ascending: false })
      .limit(5);
    if (error) {
      console.error('[db.getEntryBeliefs]', error);
      return [];
    }
    return (data ?? []) as BeliefFull[];
  } catch (err) {
    console.error('[db.getEntryBeliefs]', err);
    return [];
  }
}

export async function addBelief(
  userId: string,
  content: string
): Promise<BeliefFull | null> {
  try {
    const trimmed = content.trim();
    if (!trimmed) return null;
    const now = new Date().toISOString();
    // source='manual': distingue do que a IA sugeriu (treino). Resiliente: se a
    // coluna `source` ainda não existir (42703), reinsere sem ela.
    const base = {
      user_id: userId,
      content: trimmed,
      content_original: trimmed,
      validation: 'confirmed' as const,
      first_seen_at: now,
      last_seen_at: now,
      occurrence_count: 1,
      version: 1,
    };
    const cols = 'id, content, content_original, validation, occurrence_count';
    let { data, error } = await supabase
      .from('beliefs')
      .insert({ ...base, source: 'manual' })
      .select(cols)
      .single();
    if (error?.code === '42703') {
      ({ data, error } = await supabase.from('beliefs').insert(base).select(cols).single());
    }
    if (error) {
      console.error('[db.addBelief]', error);
      return null;
    }
    return data as BeliefFull;
  } catch (err) {
    console.error('[db.addBelief]', err);
    return null;
  }
}

export async function setBeliefValidation(
  beliefId: string,
  validation: 'confirmed' | 'edited' | 'rejected'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('beliefs')
      .update({ validation })
      .eq('id', beliefId);
    if (error) {
      console.error('[db.setBeliefValidation]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[db.setBeliefValidation]', err);
    return false;
  }
}

// Marca como 'ignored' as crenças daquele registro que continuaram 'pending' ao
// avançar (não confirmadas/editadas/rejeitadas). Mesma ideia do equivalente de
// emoções: todo item sugerido termina flagrado e não reaparece. Resiliente ao
// enum ainda não ter 'ignored'.
export async function ignorePendingBeliefs(
  userId: string,
  entryId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('beliefs')
      .update({ validation: 'ignored' })
      .eq('user_id', userId)
      .eq('source_entry_id', entryId)
      .is('deleted_at', null)
      .eq('validation', 'pending');
    if (error) {
      if (SCHEMA_MISMATCH_CODES.has(error.code)) {
        console.warn('[db.ignorePendingBeliefs] enum sem valor "ignored" ainda (migration pendente).');
        return false;
      }
      console.error('[db.ignorePendingBeliefs]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[db.ignorePendingBeliefs]', err);
    return false;
  }
}

// Edita o texto de uma crença sem chamar IA. Resiliente a schema mínimo: tenta
// gravar content + validation('edited') + version e, se alguma coluna não
// existir (42703) ou o enum não aceitar 'edited' (22P02/22023/23514), cai para
// payloads mais simples — o mínimo (só content) sempre persiste o texto editado.
export async function updateBelief(
  beliefId: string,
  content: string
): Promise<boolean> {
  return updateRowResilient('beliefs', beliefId, content, 'content', '[db.updateBelief]');
}

// Códigos Postgres que indicam "coluna/enum incompatível" — dá pra tentar um
// payload mais simples. Outros erros (ex.: 42501 permission) não adiantam.
const SCHEMA_MISMATCH_CODES = new Set(['42703', '22P02', '22023', '23514']);

// UPDATE resiliente usado por edições "sem IA" (crença/emoção). Persiste sempre
// o campo principal (`field`), tentando também validation='edited' e version
// quando o schema suporta. Confere linhas afetadas (RLS → 0 linhas → false).
async function updateRowResilient(
  table: 'beliefs' | 'emotions',
  rowId: string,
  value: string,
  field: 'content' | 'name',
  logTag: string
): Promise<boolean> {
  try {
    const trimmed = value.trim();
    if (!trimmed) return false;

    let version: number | undefined;
    const { data: current } = await supabase
      .from(table)
      .select('version')
      .eq('id', rowId)
      .maybeSingle();
    if (current && typeof current.version === 'number') version = current.version + 1;

    // Do mais completo ao mínimo. O último (só o campo) garante o texto salvo.
    const attempts: Record<string, unknown>[] = [
      { [field]: trimmed, validation: 'edited', ...(version !== undefined ? { version } : {}) },
      { [field]: trimmed, validation: 'edited' },
      { [field]: trimmed },
    ];

    for (const payload of attempts) {
      const res = await supabase.from(table).update(payload).eq('id', rowId).select('id');
      if (!res.error) {
        if ((res.data?.length ?? 0) === 0) {
          console.error(`${logTag} UPDATE afetou 0 linhas (provável RLS sem policy de UPDATE em ${table}).`);
          return false;
        }
        return true;
      }
      if (SCHEMA_MISMATCH_CODES.has(res.error.code)) continue; // tenta payload mais simples
      console.error(logTag, res.error); // ex.: 42501 permission — não dá pra contornar
      return false;
    }
    console.error(`${logTag} todas as tentativas falharam (coluna/enum incompatível).`);
    return false;
  } catch (err) {
    console.error(logTag, err);
    return false;
  }
}

// Exclusão de crença = soft delete (deleted_at). Nunca DELETE físico.
// Filtra por dono e confere linhas afetadas (mesmo motivo do deleteEntry):
// evita "falso sucesso" quando o RLS bloqueia o UPDATE.
export async function deleteBeliefById(
  userId: string,
  beliefId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('beliefs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', beliefId)
      .eq('user_id', userId)
      .select('id');
    if (error) {
      console.error('[db.deleteBeliefById]', error);
      return false;
    }
    return (data?.length ?? 0) > 0;
  } catch (err) {
    console.error('[db.deleteBeliefById]', err);
    return false;
  }
}

// ── Patterns ───────────────────────────────────────────────────────────────

export interface PatternFull {
  id: string;
  description: string;
  triggers: string[] | null;
  emotions_involved: string[] | null;
  validation: 'pending' | 'confirmed' | 'edited' | 'rejected' | 'ignored';
  occurrence_count: number;
}

export async function getPendingPattern(
  userId: string
): Promise<PatternFull | null> {
  try {
    const { data, error } = await supabase
      .from('patterns')
      .select('id, description, triggers, emotions_involved, validation, occurrence_count')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .eq('validation', 'pending')
      .order('first_detected_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('[db.getPendingPattern]', error);
      return null;
    }
    return (data as PatternFull) ?? null;
  } catch (err) {
    console.error('[db.getPendingPattern]', err);
    return null;
  }
}

export async function setPatternValidation(
  patternId: string,
  validation: 'confirmed' | 'edited' | 'rejected'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('patterns')
      .update({ validation })
      .eq('id', patternId);
    if (error) {
      console.error('[db.setPatternValidation]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[db.setPatternValidation]', err);
    return false;
  }
}

// Quantas vezes o usuário pode adiar ("deixar pra depois") o modal do padrão na
// home antes de ele ser marcado como 'ignored' (não reaparece e fica flagrado).
export const PATTERN_DISMISS_LIMIT = 3;

// Registra um adiamento do modal de padrão: incrementa dismiss_count e, ao
// atingir PATTERN_DISMISS_LIMIT, marca validation='ignored'. Resiliente: se a
// coluna dismiss_count ou o valor 'ignored' do enum ainda não existirem
// (migration pendente), apenas não persiste — o modal continua reabrindo como
// hoje, sem quebrar nada. Retorna true se o padrão passou a 'ignored'.
export async function dismissPattern(patternId: string): Promise<boolean> {
  try {
    const { data: current, error: readErr } = await supabase
      .from('patterns')
      .select('dismiss_count')
      .eq('id', patternId)
      .maybeSingle();
    // Sem a coluna ainda: nada a fazer (migration pendente).
    if (readErr?.code === '42703') return false;
    if (readErr) {
      console.error('[db.dismissPattern] read', readErr);
      return false;
    }

    const next = (current?.dismiss_count ?? 0) + 1;
    const reached = next >= PATTERN_DISMISS_LIMIT;
    const payload: Record<string, unknown> = { dismiss_count: next };
    if (reached) payload.validation = 'ignored';

    const { error: updErr } = await supabase
      .from('patterns')
      .update(payload)
      .eq('id', patternId);
    if (updErr) {
      // Enum sem 'ignored' ainda: ao menos persiste a contagem (sem o status).
      if (reached && SCHEMA_MISMATCH_CODES.has(updErr.code)) {
        await supabase.from('patterns').update({ dismiss_count: next }).eq('id', patternId);
        return false;
      }
      if (updErr.code === '42703') return false;
      console.error('[db.dismissPattern] update', updErr);
      return false;
    }
    return reached;
  } catch (err) {
    console.error('[db.dismissPattern]', err);
    return false;
  }
}

// Edita a descrição de um padrão sem chamar IA: marca validation = 'edited'.
export async function updatePattern(
  patternId: string,
  description: string
): Promise<boolean> {
  try {
    const trimmed = description.trim();
    if (!trimmed) return false;
    const { data, error } = await supabase
      .from('patterns')
      .update({ description: trimmed, validation: 'edited' })
      .eq('id', patternId)
      .select('id');
    if (error) {
      console.error('[db.updatePattern]', error);
      return false;
    }
    if ((data?.length ?? 0) === 0) {
      console.error('[db.updatePattern] UPDATE afetou 0 linhas (provável RLS sem policy de UPDATE em patterns).');
      return false;
    }
    return true;
  } catch (err) {
    console.error('[db.updatePattern]', err);
    return false;
  }
}

export async function createTextEntry(
  userId: string,
  rawText: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('entries')
      .insert({
        user_id: userId,
        input_type: 'text',
        raw_text: rawText,
        processing_status: 'pending',
        recorded_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[db.createTextEntry]', error);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error('[db.createTextEntry]', err);
    return null;
  }
}

export async function getEntriesForSummary(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<EntryDetail[] | null> {
  try {
    let query = supabase
      .from('entries')
      .select(
        'id, raw_text, processed_text, created_at, input_type, processing_status, emotions(id, name, validation), entry_analysis_logs(parsed_thoughts, created_at)'
      )
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, error } = await query;
    if (error) {
      console.error('[db.getEntriesForSummary]', error);
      return null;
    }

    type SummaryRow = EntryRow & {
      entry_analysis_logs:
        | Array<{ parsed_thoughts: unknown; created_at: string }>
        | null;
    };

    return (data as SummaryRow[]).map((row) => {
      const logs = row.entry_analysis_logs ?? [];
      const latestLog = logs.length
        ? [...logs].sort((a, b) =>
            b.created_at.localeCompare(a.created_at)
          )[0]
        : null;
      return {
        ...mapEntryRow(row),
        parsed_thoughts: parseThoughts(latestLog?.parsed_thoughts),
      };
    });
  } catch (err) {
    console.error('[db.getEntriesForSummary]', err);
    return null;
  }
}

// ── Insights ────────────────────────────────────────────────────────────────

export interface EmotionCount {
  name: string;
  count: number;
}

export interface BeliefInsight {
  id: string;
  content: string;
  occurrence_count: number;
  validation: string;
}

export interface PatternInsight {
  id: string;
  description: string;
  triggers: string[];
  emotions_involved: string[];
  occurrence_count: number;
}

export type InsightsFilter = '7days' | '15days' | '30days' | 'all';

function sinceFor(filter: InsightsFilter): string | null {
  if (filter === 'all') return null;
  const days = filter === '7days' ? 7 : filter === '15days' ? 15 : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// Busca emoções agrupadas por nome com contagem (para nuvem de emoções)
export async function getEmotionCounts(
  userId: string,
  filter: InsightsFilter = 'all'
): Promise<EmotionCount[]> {
  try {
    let query = supabase
      .from('emotions')
      .select('name, created_at')
      .eq('user_id', userId)
      .eq('validation', 'confirmed');
    const since = sinceFor(filter);
    if (since) query = query.gte('created_at', since);
    const { data, error } = await query;
    if (error) { console.error('[db.getEmotionCounts]', error); return []; }
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.name] = (counts[row.name] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch (err) {
    console.error('[db.getEmotionCounts]', err);
    return [];
  }
}

// Busca crenças do usuário (não deletadas, não rejeitadas)
export async function getBeliefs(
  userId: string,
  filter: InsightsFilter = 'all'
): Promise<BeliefInsight[]> {
  try {
    let query = supabase
      .from('beliefs')
      .select('id, content, occurrence_count, validation, last_seen_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .neq('validation', 'rejected')
      .order('occurrence_count', { ascending: false });
    const since = sinceFor(filter);
    if (since) query = query.gte('last_seen_at', since);
    const { data, error } = await query;
    if (error) { console.error('[db.getBeliefs]', error); return []; }
    return (data ?? []) as BeliefInsight[];
  } catch (err) {
    console.error('[db.getBeliefs]', err);
    return [];
  }
}

// ── Admin ──────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  users_trial: number;
  users_active: number;
  subs_annual_active: number;
  subs_monthly_active: number;
  users_apple: number;
  users_google: number;
  total_entries: number;
  avg_weekly_entries_per_user: number;
  emotions_total: number;
  emotions_confirmed: number;
  emotions_rejected: number;
  emotions_adjusted: number;
  thoughts_total: number;
  thoughts_confirmed: number;
  thoughts_rejected: number;
  thoughts_adjusted: number;
  beliefs_total: number;
  beliefs_confirmed: number;
  beliefs_rejected: number;
  beliefs_adjusted: number;
  patterns_total: number;
  patterns_confirmed: number;
  patterns_rejected: number;
  patterns_adjusted: number;
  feedback_total: number;
  feedback_new: number;
  feedback_read: number;
  feedback_resolved: number;
}

export type FeedbackStatus = 'new' | 'read' | 'resolved';

export interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  entries_count: number;
}

export interface FeedbackItem {
  id: string;
  user_id: string;
  message: string;
  status: FeedbackStatus;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
}

export async function getAdminStats(): Promise<AdminStats | null> {
  try {
    const { data, error } = await supabase.rpc('get_admin_stats');
    if (error) {
      console.error('[db.getAdminStats]', error);
      return null;
    }
    return data as AdminStats;
  } catch (err) {
    console.error('[db.getAdminStats]', err);
    return null;
  }
}

export async function getAdminFeedback(
  status?: FeedbackStatus
): Promise<FeedbackItem[]> {
  try {
    const { data, error } = await supabase.rpc('get_admin_feedback', {
      p_status: status ?? null,
    });
    if (error) {
      console.error('[db.getAdminFeedback]', error);
      return [];
    }
    return (data ?? []) as FeedbackItem[];
  } catch (err) {
    console.error('[db.getAdminFeedback]', err);
    return [];
  }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase.rpc('get_admin_users');
    if (error) {
      console.error('[db.getAdminUsers]', error);
      return [];
    }
    return (data ?? []) as AdminUser[];
  } catch (err) {
    console.error('[db.getAdminUsers]', err);
    return [];
  }
}

export async function updateFeedbackStatus(
  feedbackId: string,
  status: FeedbackStatus
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('update_feedback_status', {
      p_feedback_id: feedbackId,
      p_status: status,
    });
    if (error) {
      console.error('[db.updateFeedbackStatus]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[db.updateFeedbackStatus]', err);
    return false;
  }
}

// Busca padrões do usuário (não deletados)
export async function getPatterns(
  userId: string,
  filter: InsightsFilter = 'all'
): Promise<PatternInsight[]> {
  try {
    let query = supabase
      .from('patterns')
      .select('id, description, triggers, emotions_involved, occurrence_count, last_updated_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .neq('validation', 'rejected')
      .order('occurrence_count', { ascending: false });
    const since = sinceFor(filter);
    if (since) query = query.gte('last_updated_at', since);
    const { data, error } = await query;
    if (error) { console.error('[db.getPatterns]', error); return []; }
    return (data ?? []) as PatternInsight[];
  } catch (err) {
    console.error('[db.getPatterns]', err);
    return [];
  }
}

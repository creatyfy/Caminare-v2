// =============================================================================
// POST /api/delete-account
// -----------------------------------------------------------------------------
// Remove o usuário de AUTENTICAÇÃO (auth.users) do Supabase. A função de banco
// `delete_my_account` limpa os dados do usuário, mas NÃO consegue apagar o
// registro de auth — por isso, ao fazer login com Google/Apple de novo, o mesmo
// usuário era reencontrado e a conta "excluída" reabria. Só o servidor, com a
// chave de serviço (service_role), consegue apagar o usuário de auth.
//
// Fluxo no app: o cliente chama a RPC delete_my_account (dados) e, em seguida,
// este endpoint (usuário de auth). Depois encerra a sessão local.
// =============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireUser, serviceClient, sendJson, sendError } from './_lib/runtime.js';
import { applyCors } from './_lib/cors.js';

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Método não permitido. Use POST.');
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const db = serviceClient();
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('[delete-account] falha ao excluir usuário de auth:', error.message);
    return sendError(res, 502, 'Não foi possível excluir a conta de autenticação agora.');
  }

  return sendJson(res, 200, { status: 'ok' });
}

import {
  adminClient,
  corsHeaders,
  fail,
  json,
  requireUser,
} from './supabase.ts';

/** JWT identity is resolved here; the client can never supply the RPC's p_user. */
export function duoHandler(
  action: 'create' | 'join' | 'ready' | 'answer' | 'advance' | 'abandon',
) {
  return async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS')
      return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return fail('Use POST.', 405);
    const { user, error } = await requireUser(req);
    if (!user) return fail(error ?? 'Unauthorized', 401);
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body))
      return fail('Invalid payload.');
    const uuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (
      action !== 'create' &&
      action !== 'join' &&
      (typeof body.matchId !== 'string' || !uuid.test(body.matchId))
    )
      return fail('Invalid matchId.');
    if (
      action === 'join' &&
      (typeof body.roomCode !== 'string' ||
        !/^[a-z0-9]{6}$/i.test(body.roomCode.trim()))
    )
      return fail('Enter a six-character room code.');
    if (
      (action === 'answer' || action === 'advance') &&
      (!Number.isInteger(body.questionIndex) || body.questionIndex < 0)
    )
      return fail('Invalid questionIndex.');
    if (
      action === 'answer' &&
      body.chosenIndex !== null &&
      (!Number.isInteger(body.chosenIndex) || body.chosenIndex < 0)
    )
      return fail('Invalid chosenIndex.');
    const { data, error: rpcError } = await adminClient().rpc('duo_command', {
      p_user: user.id,
      p_action: action,
      p_match: action === 'create' || action === 'join' ? null : body.matchId,
      p_room: action === 'join' ? body.roomCode.trim().toUpperCase() : null,
      p_name:
        typeof body.displayName === 'string'
          ? body.displayName
          : typeof user.user_metadata?.display_name === 'string'
            ? user.user_metadata.display_name
            : 'Player',
      p_question:
        action === 'answer' || action === 'advance' ? body.questionIndex : null,
      p_choice: action === 'answer' ? body.chosenIndex : null,
    });
    if (rpcError) {
      const status =
        rpcError.code === '42501'
          ? 403
          : rpcError.code === 'P0002'
            ? 404
            : rpcError.code === 'P0001'
              ? 409
              : 500;
      return fail(
        status === 500
          ? 'Could not update the match. Please retry.'
          : rpcError.message,
        status,
      );
    }
    return json(data);
  };
}

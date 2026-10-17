/** Exercises real local Auth, REST, Edge Functions, Postgres transactions and Realtime.
 * Local by default; pass an exact hosted project ref to test that project.
 * Creates and removes only its own disposable users and their matches.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const projectRef = process.argv[2];
const cli = (args) =>
  JSON.parse(
    execFileSync('npx', ['--yes', 'supabase@2.121.0', ...args, '-o', 'json'], {
      cwd: new URL('../../', import.meta.url),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }),
  );
let cfg;
if (projectRef) {
  assert.match(
    projectRef,
    /^[a-z]{20}$/,
    'Pass the exact project reference to opt into hosted test fixtures',
  );
  const keys = cli(['projects', 'api-keys', '--project-ref', projectRef]);
  cfg = {
    API_URL: `https://${projectRef}.supabase.co`,
    ANON_KEY: keys.find((k) => k.name === 'anon').api_key,
    SERVICE_ROLE_KEY: keys.find((k) => k.name === 'service_role').api_key,
  };
} else {
  cfg = cli(['status']);
  assert.ok(
    ['127.0.0.1', 'localhost', '::1'].includes(new URL(cfg.API_URL).hostname),
    'Local-only by default',
  );
}
const url = cfg.API_URL;
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, cfg.SERVICE_ROLE_KEY, opts);
const people = [],
  channels = [];
let checks = 0;
function passed(name) {
  checks++;
  console.log(`PASS ${name}`);
}
async function call(person, action, body, status = 200) {
  const r = await fetch(`${url}/functions/v1/duo-${action}`, {
    method: 'POST',
    headers: {
      apikey: cfg.ANON_KEY,
      Authorization: `Bearer ${person.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  assert.equal(r.status, status, `${action}: ${JSON.stringify(data)}`);
  return data;
}
async function match(id) {
  const { data, error } = await admin
    .from('duo_matches')
    .select('*')
    .eq('id', id)
    .single();
  assert.ifError(error);
  return data;
}
async function start(host, guest) {
  const m = await call(host, 'create-match', {});
  await call(guest, 'join-match', { roomCode: m.roomCode });
  await Promise.all(
    [host, guest].map((p) => call(p, 'ready', { matchId: m.matchId })),
  );
  return m;
}
async function subscribe(person, id) {
  const events = [];
  const channel = person.client
    .channel(`audit-${person.id}-${id}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'duo_matches',
        filter: `id=eq.${id}`,
      },
      (p) => events.push(p.new),
    );
  channels.push({ client: person.client, channel });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Error('Realtime subscription timeout')),
      12000,
    );
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(timer);
        resolve();
      }
      if (status === 'CHANNEL_ERROR') {
        clearTimeout(timer);
        reject(Error('Realtime channel error'));
      }
    });
  });
  return events;
}
try {
  for (let i = 0; i < 4; i++) {
    const email = `duo-audit-${randomUUID()}@example.com`,
      password = randomUUID() + 'aA1!';
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    assert.ifError(error);
    const person = { id: data.user.id };
    people.push(person);
    person.client = createClient(url, cfg.ANON_KEY, opts);
    const signed = await person.client.auth.signInWithPassword({
      email,
      password,
    });
    assert.ifError(signed.error);
    person.token = signed.data.session.access_token;
  }
  const [h, g, rival, outsider] = people;
  const room = await call(h, 'create-match', {}),
    id = room.matchId;
  assert.equal(
    (await outsider.client.from('duo_matches').select('*').eq('id', id)).data
      .length,
    0,
  );
  await call(outsider, 'ready', { matchId: id }, 403);
  assert.equal((await match(id)).status, 'waiting');
  passed('outsider cannot read or change a waiting room');
  const joins = await Promise.all(
    [g, rival].map(async (p) => {
      const r = await fetch(`${url}/functions/v1/duo-join-match`, {
        method: 'POST',
        headers: {
          apikey: cfg.ANON_KEY,
          Authorization: `Bearer ${p.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomCode: room.roomCode }),
      });
      return { p, status: r.status };
    }),
  );
  assert.deepEqual(joins.map((j) => j.status).sort(), [200, 409]);
  const guest = joins.find((j) => j.status === 200).p;
  const participantRows = await admin
    .from('duo_participants')
    .select('*')
    .eq('match_id', id);
  assert.equal(participantRows.data.length, 2);
  passed('concurrent joins admit exactly one guest');
  for (const [label, result] of [
    [
      'winner spoof',
      await h.client
        .from('duo_matches')
        .update({ winner_id: h.id, status: 'finished' })
        .eq('id', id),
    ],
    [
      'score spoof',
      await h.client
        .from('duo_participants')
        .update({ score: 9999 })
        .eq('match_id', id)
        .eq('user_id', h.id),
    ],
    [
      'participant insertion',
      await outsider.client
        .from('duo_participants')
        .insert({
          match_id: id,
          user_id: outsider.id,
          display_name: 'spoof',
          role: 'guest',
          score: 9999,
        }),
    ],
    [
      'direct privileged RPC',
      await h.client.rpc('duo_command', {
        p_user: h.id,
        p_action: 'abandon',
        p_match: id,
      }),
    ],
  ])
    assert.ok(result.error, `${label} must be denied`);
  assert.ifError(
    (
      await h.client
        .from('duo_participants')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('match_id', id)
        .eq('user_id', h.id)
    ).error,
  );
  passed('RLS/column privileges deny tampering but allow presence');
  const events = await Promise.all([h, guest].map((p) => subscribe(p, id)));
  await Promise.all([h, guest].map((p) => call(p, 'ready', { matchId: id })));
  assert.equal((await match(id)).status, 'active');
  const questions = await admin
    .from('content_questions')
    .select('id,answer_index,options');
  assert.ifError(questions.error);
  const key = new Map(questions.data.map((q) => [q.id, q]));
  for (let index = 0; index < room.questionCount; index++) {
    const state = await match(id),
      q = key.get(state.question_ids[index]);
    if (index === 0) {
      await call(
        h,
        'submit-answer',
        { matchId: id, questionIndex: index, chosenIndex: 999 },
        409,
      );
    }
    const responses = await Promise.all(
      [h, guest].map((p) =>
        call(p, 'submit-answer', {
          matchId: id,
          questionIndex: index,
          chosenIndex: q.answer_index,
        }),
      ),
    );
    const duplicate = await call(h, 'submit-answer', {
      matchId: id,
      questionIndex: index,
      chosenIndex: (q.answer_index + 1) % q.options.length,
    });
    assert.equal(duplicate.awardedPoints, responses[0].awardedPoints);
    assert.equal(duplicate.isCorrect, true);
    await Promise.all(
      [h, guest].map((p) =>
        call(p, 'advance', { matchId: id, questionIndex: index }),
      ),
    );
    const stateAfter = await match(id);
    assert.equal(
      stateAfter.current_index,
      Math.min(index + 1, room.questionCount - 1),
    );
  }
  const finished = await match(id);
  assert.equal(finished.status, 'finished');
  const answers = await admin
    .from('duo_answers')
    .select('*')
    .eq('match_id', id);
  const players = await admin
    .from('duo_participants')
    .select('*')
    .eq('match_id', id);
  assert.equal(answers.data.length, room.questionCount * 2);
  for (const p of players.data)
    assert.equal(
      p.score,
      answers.data
        .filter((a) => a.user_id === p.user_id)
        .reduce((sum, a) => sum + a.awarded_points, 0),
    );
  const [a, b] = players.data;
  assert.equal(finished.is_tie, a.score === b.score);
  assert.equal(
    finished.winner_id,
    a.score === b.score ? null : a.score > b.score ? a.user_id : b.user_id,
  );
  passed(
    'full match, concurrent advancement, idempotent answers and correct final scores',
  );
  const deadline = Date.now() + 8000;
  while (
    events.some((e) => !e.some((v) => v.status === 'finished')) &&
    Date.now() < deadline
  )
    await new Promise((r) => setTimeout(r, 100));
  assert.ok(
    events.every(
      (e) =>
        e.some((v) => v.status === 'active') &&
        e.some((v) => v.status === 'finished'),
    ),
    JSON.stringify(events.map((e) => e.map((v) => v.status))),
  );
  passed('both authenticated Realtime clients observe start and finish');
  const timed = await start(h, g);
  let state = await match(timed.matchId);
  const q = key.get(state.question_ids[0]);
  await call(h, 'submit-answer', {
    matchId: timed.matchId,
    questionIndex: 0,
    chosenIndex: q.answer_index,
  });
  assert.ifError(
    (
      await admin
        .from('duo_matches')
        .update({
          question_started_at: new Date(Date.now() - 23000).toISOString(),
        })
        .eq('id', timed.matchId)
    ).error,
  );
  await call(h, 'advance', { matchId: timed.matchId, questionIndex: 0 });
  assert.equal((await match(timed.matchId)).current_index, 1);
  const missing = await admin
    .from('duo_answers')
    .select('*')
    .eq('match_id', timed.matchId)
    .eq('user_id', g.id)
    .eq('question_index', 0)
    .single();
  assert.ifError(missing.error);
  assert.equal(missing.data.awarded_points, 0);
  assert.equal(missing.data.chosen_index, null);
  await call(h, 'advance', { matchId: timed.matchId, questionIndex: 0 });
  assert.equal((await match(timed.matchId)).current_index, 1);
  passed(
    'disconnected opponent gets server timeout; stale advance cannot skip a round',
  );
  await call(g, 'abandon', { matchId: timed.matchId });
  await call(h, 'abandon', { matchId: timed.matchId });
  assert.equal((await match(timed.matchId)).winner_id, h.id);
  passed('forfeit cannot overwrite an already finished winner');
  console.log(
    `${checks} integration groups passed against ${projectRef ? 'hosted' : 'local'} Supabase.`,
  );
} finally {
  for (const c of channels) await c.client.removeChannel(c.channel);
  for (const p of people) {
    if (p.client) await p.client.removeAllChannels();
    const { error } = await admin.auth.admin.deleteUser(p.id);
    if (error) console.error('Test fixture cleanup failed:', error.message);
  }
}

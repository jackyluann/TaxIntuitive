/** Writes only the public client credentials. Server keys never enter the app's environment. */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const projectRef = process.argv[2];
const cli = (args) =>
  JSON.parse(
    execFileSync('npx', ['--yes', 'supabase@2.121.0', ...args, '-o', 'json'], {
      cwd: new URL('../../', import.meta.url),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }),
  );
let url, key;
if (projectRef && projectRef !== '--local') {
  assert.match(
    projectRef,
    /^[a-z]{20}$/,
    'Expected a Supabase project reference',
  );
  const keys = cli(['projects', 'api-keys', '--project-ref', projectRef]);
  url = `https://${projectRef}.supabase.co`;
  key = keys.find((k) => k.name === 'anon')?.api_key;
} else {
  const local = cli(['status']);
  url = local.API_URL;
  key = local.ANON_KEY;
}
assert.ok(url && key, 'Public Supabase configuration missing');
writeFileSync(
  new URL('../.env', import.meta.url),
  `EXPO_PUBLIC_SUPABASE_URL=${url}\nEXPO_PUBLIC_SUPABASE_ANON_KEY=${key}\n`,
  { mode: 0o600 },
);
console.log(`App connected to ${url}. Restart Expo to reload its environment.`);

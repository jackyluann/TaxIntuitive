import { duoHandler } from '../_shared/duo-handler.ts';

Deno.serve(duoHandler('answer'));

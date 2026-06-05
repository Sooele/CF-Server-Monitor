import { saveMetricsHistory } from '../database/schema.js';
import { checkServerExists, clearServerDetailCache } from '../utils/cache.js';

export async function handleUpdate(request, env, ctx) {
  try {
    const data = await request.json();
    const { id, secret, metrics } = data;

    if (secret !== env.API_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized', code: 401 }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    let countryCode = request.cf?.country || '';
    if (countryCode.toUpperCase() === 'TW') countryCode = 'CN';

    const serverExists = await checkServerExists(env.DB, id);
    
    if (!serverExists) {
      return new Response('Server not found', { status: 404 });
    }

    await saveMetricsHistory(env.DB, id, metrics, countryCode);

    return new Response('OK', { status: 200 });
  } catch (e) {
    console.error('更新数据失败:', e);
    return new Response(`Error: ${e.message}`, { status: 400 });
  }
}

export { clearServerDetailCache };
// Integration test for the backend against a throw-away in-memory MongoDB.
// Never touches the real database.
const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');


const BACKEND = path.resolve(__dirname, '..');
const PORT = 5077;
const BASE = `http://127.0.0.1:${PORT}`;
let failures = 0;
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`);
  if (!cond) failures++;
};
const j = async (method, url, body, token) => {
  const res = await fetch(BASE + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null; try { data = await res.json(); } catch {}
  return { status: res.status, data };
};

(async () => {
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri('ayamtest');
  const server = spawn('node', ['src/index.js'], {
    cwd: BACKEND,
    env: { ...process.env, MONGODB_URI: uri, PORT: String(PORT), JWT_SECRET: 'test-secret', ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: 'test-pass', NODE_ENV: 'test', DOTENV_CONFIG_PATH: '/nonexistent' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  server.stdout.on('data', d => (log += d)); server.stderr.on('data', d => (log += d));
  for (let i = 0; i < 60 && !log.includes('Server running'); i++) await new Promise(r => setTimeout(r, 250));
  check('server starts on test DB', log.includes('Server running'), log.includes('Connected') ? '' : log.slice(0, 300));

  try {
    // Auth
    const login = await j('POST', '/api/auth/login', { username: 'admin', password: 'test-pass' });
    check('admin login', login.status === 200 && !!login.data.token);
    const token = login.data.token;

    // Article in the new category
    const created = await j('POST', '/api/articles', { title: 'وفاة الحاج', description: 'تفاصيل الجنازة', content: '<p>x</p>', category: 'وفيات' }, token);
    check('create article in وفيات', created.status === 201, `status ${created.status}`);
    const id = created.data.article._id;

    // Views
    let r = await j('GET', `/api/articles/${id}?noview=1`);
    check('GET ?noview=1 does not count', r.data.article.views === 0, `views=${r.data.article.views}`);
    r = await j('GET', `/api/articles/${id}`, null, token);
    check('admin GET (auth header) does not count', r.data.article.views === 0, `views=${r.data.article.views}`);
    r = await j('GET', `/api/articles/${id}`);
    check('old app GET still counts', r.data.article.views === 1, `views=${r.data.article.views}`);
    const v1 = await j('POST', `/api/articles/${id}/view`, { deviceId: 'phoneA' });
    const v2 = await j('POST', `/api/articles/${id}/view`, { deviceId: 'phoneA' });
    const v3 = await j('POST', `/api/articles/${id}/view`, { deviceId: 'phoneB' });
    check('view counted once per device', v1.data.counted === true && v2.data.counted === false && v3.data.counted === true);
    r = await j('GET', `/api/articles/${id}?noview=1`);
    check('total views = 3', r.data.article.views === 3, `views=${r.data.article.views}`);
    const bad = await j('POST', `/api/articles/${id}/view`, {});
    check('view without deviceId rejected', bad.status === 400);

    // Category subscriptions
    await j('POST', '/api/notifications/subscribe', { token: 'ExponentPushToken[weddingsOnly]', platform: 'ios', categories: ['افراح', 'not-a-category'] });
    await j('POST', '/api/notifications/subscribe', { token: 'ExponentPushToken[all]', platform: 'android', categories: [] });
    await j('POST', '/api/notifications/subscribe', { token: 'ExponentPushToken[oldApp]', platform: 'android' });
    // old app re-subscribes without categories: must not wipe a stored choice
    await j('POST', '/api/notifications/subscribe', { token: 'ExponentPushToken[weddingsOnly]', platform: 'ios' });

    const mongoose = require(path.join(BACKEND, 'node_modules/mongoose'));
    await mongoose.connect(uri);
    const { getActiveTokens } = require(path.join(BACKEND, 'src/services/subscribers'));
    const PushToken = require(path.join(BACKEND, 'src/models/PushToken'));
    const stored = await PushToken.findOne({ token: 'ExponentPushToken[weddingsOnly]' });
    check('invalid category filtered, choice kept on old-style resubscribe', JSON.stringify(stored.categories) === JSON.stringify(['افراح']), JSON.stringify(stored.categories));
    const wed = (await getActiveTokens('افراح')).sort();
    const news = (await getActiveTokens('اخبار البلد')).sort();
    const everyone = await getActiveTokens();
    check('wedding news → weddings-only + all + old app', wed.length === 3, wed.join(','));
    check('town news → not the weddings-only phone', news.length === 2 && !news.includes('ExponentPushToken[weddingsOnly]'), news.join(','));
    check('ads/general → everyone', everyone.length === 3);
    await j('POST', '/api/notifications/unsubscribe', { token: 'ExponentPushToken[all]' });
    check('unsubscribed phone gets nothing', !(await getActiveTokens()).includes('ExponentPushToken[all]'));

    // Reports
    const rep1 = await j('POST', '/api/reports', { targetType: 'article', targetId: id, reason: 'معلومة خاطئة', deviceId: 'phoneA' });
    const rep2 = await j('POST', '/api/reports', { targetType: 'article', targetId: id, reason: 'معلومة خاطئة', deviceId: 'phoneA' });
    const rep3 = await j('POST', '/api/reports', { targetType: 'article', targetId: id, reason: 'محتوى مسيء', deviceId: 'phoneB' });
    check('reports accepted', rep1.status === 201 && rep2.status === 201 && rep3.status === 201);
    const badRep = await j('POST', '/api/reports', { targetType: 'article', targetId: '000000000000000000000000', deviceId: 'x' });
    check('report on missing item → 404', badRep.status === 404);
    const noAuth = await j('GET', '/api/reports');
    check('report list needs login', noAuth.status === 401);
    let list = await j('GET', '/api/reports', null, token);
    check('one group, 2 reports (same phone counted once)', list.data.reports.length === 1 && list.data.reports[0].count === 2, JSON.stringify(list.data.reports[0]));
    let stats = await j('GET', '/api/notifications/stats', null, token);
    check('stats.openReports = 2', stats.data.openReports === 2, `openReports=${stats.data.openReports}`);
    await j('POST', '/api/reports/resolve', { targetType: 'article', targetId: id }, token);
    list = await j('GET', '/api/reports', null, token);
    stats = await j('GET', '/api/notifications/stats', null, token);
    check('resolve clears the open list', list.data.reports.length === 0 && stats.data.openReports === 0);

    // Delete cleans up views
    await j('DELETE', `/api/articles/${id}`, null, token);
    const ArticleView = require(path.join(BACKEND, 'src/models/ArticleView'));
    check('deleting article removes its view records', (await ArticleView.countDocuments()) === 0);

    // Rate limit on admin login (10 failed attempts / 15 min)
    let last;
    for (let i = 0; i < 11; i++) last = await j('POST', '/api/auth/login', { username: 'admin', password: 'wrong' });
    check('11th wrong password → 429', last.status === 429, `status ${last.status}`);

    await mongoose.disconnect();
  } catch (e) {
    check('no exception', false, e.stack);
    console.log(log.slice(-1500));
  } finally {
    server.kill();
    await mongo.stop();
    console.log(failures === 0 ? '\nALL PASSED' : `\n${failures} FAILED`);
    process.exit(failures ? 1 : 0);
  }
})();

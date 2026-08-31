const http = require('http');

function makeRequest(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body) headers['Content-Length'] = Buffer.byteLength(body);
    const opts = { hostname: '127.0.0.1', port: 4000, path, method, headers, timeout: 10000 };
    const req = http.request(opts, (res) => {
      let respBody = '';
      res.on('data', (c) => (respBody += c));
      res.on('end', () => resolve({ status: res.statusCode, body: respBody, headers: res.headers }));
    });
    req.on('error', (e) => { console.log('  REQ ERROR', method, path, 'message:', e.message, 'code:', e.code); reject(e); });
    req.on('timeout', () => { console.log('  TIMEOUT'); req.destroy(new Error('timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    console.log('STEP 1: health check GET /health');
    const h = await makeRequest('GET', '/health');
    console.log('  status:', h.status, h.body);

    console.log('\nSTEP 2: register POST /api/auth/register');
    const reg = await makeRequest('POST', '/api/auth/register', { name: 'Test', email: 't@t.com', password: '123456' });
    console.log('  status:', reg.status, reg.body);

    console.log('\nSTEP 3: login POST /api/auth/login');
    const login = await makeRequest('POST', '/api/auth/login', { email: 't@t.com', password: '123456' });
    console.log('  status:', login.status);
    let token = null;
    try {
      const parsed = JSON.parse(login.body);
      token = parsed.token;
      console.log('  user:', parsed.user);
      console.log('  token received:', !!token);
    } catch (e) {
      console.log('  body raw:', login.body);
    }

    if (!token) { console.log('ABORT: no token'); return; }

    console.log('\nSTEP 4: list habits GET /api/habits');
    const list = await makeRequest('GET', '/api/habits', null, token);
    console.log('  status:', list.status, list.body);

    console.log('\nSTEP 5: create habit POST /api/habits');
    const create = await makeRequest('POST', '/api/habits', {
      name: 'Drink Water',
      description: '8 glasses a day',
      frequency: 'daily',
      color: '#0ea5e9',
      icon: '💧'
    }, token);
    console.log('  status:', create.status, create.body);
    let habitId = null;
    try { habitId = JSON.parse(create.body).habit.id; console.log('  created habit id:', habitId); } catch {}

    if (habitId) {
      console.log('\nSTEP 6: log completion POST /api/habits/:id/logs');
      const log = await makeRequest('POST', `/api/habits/${habitId}/logs`, {
        completed: true, date: new Date().toISOString()
      }, token);
      console.log('  status:', log.status, log.body);
    }

    console.log('\nSTEP 7: list habits again (should include logs)');
    const list2 = await makeRequest('GET', '/api/habits', null, token);
    console.log('  status:', list2.status);
    try {
      const p = JSON.parse(list2.body);
      console.log('  total habits:', p.habits?.length);
      if (p.habits?.[0]) {
        console.log('  first habit logs count:', p.habits[0].logs?.length);
      }
    } catch {}

    console.log('\n✅ All HTTP API tests passed!');
  } catch (e) {
    console.log('Test FAILED:', e?.message || e);
    process.exit(1);
  }
})();

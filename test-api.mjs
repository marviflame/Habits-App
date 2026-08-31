import http from 'http';

const postData = JSON.stringify({
  name: 'API Test User',
  email: 'api@test.com',
  password: '123456'
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Making API call to register endpoint...');
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log(`BODY: ${body}`);
    console.log('\n--- Now testing /auth/login with same credentials ---');
    const loginData = JSON.stringify({ email: 'api@test.com', password: '123456' });
    const loginOpts = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };
    const req2 = http.request(loginOpts, (res2) => {
      console.log(`LOGIN STATUS: ${res2.statusCode}`);
      res2.setEncoding('utf8');
      let body2 = '';
      res2.on('data', (c) => (body2 += c));
      res2.on('end', () => {
        console.log(`LOGIN BODY: ${body2}`);
        try {
          const parsed = JSON.parse(body2);
          const token = parsed?.token;
          if (token) {
            console.log('\n--- Now creating a habit with the token ---');
            const habitData = JSON.stringify({
              name: 'Test Habit from Script',
              description: 'Hello world',
              frequency: 'daily',
              color: '#10b981',
              icon: '🏃'
            });
            const habitOpts = {
              hostname: 'localhost',
              port: 4000,
              path: '/api/habits',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(habitData)
              }
            };
            const req3 = http.request(habitOpts, (res3) => {
              console.log(`HABIT STATUS: ${res3.statusCode}`);
              res3.setEncoding('utf8');
              let body3 = '';
              res3.on('data', (c) => (body3 += c));
              res3.on('end', () => {
                console.log(`HABIT BODY: ${body3}`);
                console.log('\n✅ ALL API TESTS COMPLETED');
              });
            });
            req3.on('error', (e) => console.error('Habit error:', e));
            req3.write(habitData);
            req3.end();
          }
        } catch (e) {
          console.error('Parse login body err', e);
        }
      });
    });
    req2.on('error', (e) => console.error('Login err:', e));
    req2.write(loginData);
    req2.end();
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(postData);
req.end();

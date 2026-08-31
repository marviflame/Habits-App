const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', ts: Date.now() }));
});
server.listen(4000, () => {
  console.log('MINI SERVER UP on 4000 PID=' + process.pid);
});
server.on('error', (e) => console.log('SERVER ERR:', e.code || e.message));
setInterval(() => {}, 10000);
console.log('SCRIPT START, PID=' + process.pid);

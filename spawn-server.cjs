const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const serverDir = 'c:\\Users\\Administrator\\OneDrive\\Desktop\\Habits\\server';
const outFile = path.join(serverDir, 'server-stdout.log');
const errFile = path.join(serverDir, 'server-stderr.log');
const pidFile = path.join(serverDir, 'server.pid');

const out = fs.openSync(outFile, 'w');
const err = fs.openSync(errFile, 'w');

const env = {
  ...process.env,
  PORT: '4000',
  DATABASE_URL: 'file:./dev.db',
  JWT_SECRET: 'habits-dev-secret-change-in-production',
  JWT_EXPIRES_IN: '7d',
  CORS_ORIGIN: 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174',
  NODE_ENV: 'development',
};

const child = spawn(process.execPath, ['dist/index.js'], {
  cwd: serverDir,
  env,
  detached: true,
  stdio: ['ignore', out, err],
  windowsHide: true,
});

fs.writeFileSync(pidFile, String(child.pid));
child.unref();

console.log('Spawned server. PID=' + child.pid);
console.log('STDOUT  -> ' + outFile);
console.log('STDERR  -> ' + errFile);
console.log('PIDFILE -> ' + pidFile);
console.log('');
setTimeout(() => {
  try {
    const stdout = fs.readFileSync(outFile, 'utf8');
    const stderr = fs.readFileSync(errFile, 'utf8');
    if (stdout) console.log('=== SERVER STDOUT ===\n' + stdout);
    if (stderr) console.log('=== SERVER STDERR ===\n' + stderr);
  } catch (e) {}
  process.exit(0);
}, 3500);

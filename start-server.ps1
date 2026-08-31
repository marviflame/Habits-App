$ErrorActionPreference = 'Continue'
$serverDir = "c:\Users\Administrator\OneDrive\Desktop\Habits\server"
$logFile = Join-Path $serverDir "server.log"
Remove-Item $logFile -Force -ErrorAction SilentlyContinue

$env:PORT = "4000"
$env:DATABASE_URL = "file:./dev.db"
$env:JWT_SECRET = "habits-dev-secret-change-in-production"
$env:JWT_EXPIRES_IN = "7d"
$env:CORS_ORIGIN = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
$env:NODE_ENV = "development"

Write-Host "Starting server process..."
$proc = Start-Process -FilePath "node" `
  -ArgumentList "dist/index.js" `
  -WorkingDirectory $serverDir `
  -RedirectStandardOutput $logFile `
  -RedirectStandardError "$serverDir\server-err.log" `
  -PassThru `
  -NoNewWindow

Write-Host "Server PID: $($proc.Id)"
Start-Sleep -Seconds 4
Write-Host "--- Log output ---"
Get-Content $logFile -ErrorAction SilentlyContinue
if (Test-Path "$serverDir\server-err.log") {
  Write-Host "--- Stderr ---"
  Get-Content "$serverDir\server-err.log" -ErrorAction SilentlyContinue
}
$tcp = Test-NetConnection -ComputerName localhost -Port 4000 -InformationLevel Quiet -WarningAction SilentlyContinue
Write-Host "--- Port 4000 open: $tcp ---"
if ($tcp) {
  Write-Host "✅ Server is UP"
} else {
  Write-Host "❌ Server is DOWN. PID still alive? $(-not $proc.HasExited)"
  if (-not $proc.HasExited) {
    try { Stop-Process -Id $proc.Id -Force } catch {}
  }
}

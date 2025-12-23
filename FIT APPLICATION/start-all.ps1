# Скрипт для запуска обоих серверов одновременно
Write-Host "Starting FitApplication Project..." -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow

# Проверка зависимостей
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "server\node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    cd server
    npm install
    cd ..
}

if (-not (Test-Path "mobile\node_modules")) {
    Write-Host "Installing mobile dependencies..." -ForegroundColor Yellow
    cd mobile
    npm install
    cd ..
}

# Запуск серверов в отдельных окнах
Write-Host "`nStarting Backend Server in new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start-backend.ps1"

Start-Sleep -Seconds 2

Write-Host "Starting Mobile App in new window..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start-mobile.ps1"

Write-Host "`n✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "`nBackend will be available at: http://localhost:3001" -ForegroundColor Green
Write-Host "Mobile app will open Expo DevTools in your browser" -ForegroundColor Cyan
Write-Host "`nPress any key to exit this script (servers will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


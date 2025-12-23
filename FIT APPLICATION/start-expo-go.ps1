# Скрипт для запуска через Expo Go
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Запуск через Expo Go" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Шаг 1: Проверка и настройка .env файла
Write-Host "1. Проверка .env файла..." -ForegroundColor Yellow
$envPath = "mobile\.env"

if (-not (Test-Path $envPath)) {
    Write-Host "   Создание .env файла..." -ForegroundColor Yellow
    # Получаем локальный IP
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | Select-Object -First 1).IPAddress
    
    if (-not $localIP) {
        Write-Host "   ⚠️  Не удалось найти локальный IP. Используйте: 192.168.0.15" -ForegroundColor Red
        $localIP = "192.168.0.15"
    }
    
    $envContent = "EXPO_PUBLIC_API_URL=http://$localIP`:3001"
    $envContent | Out-File -FilePath $envPath -Encoding utf8
    Write-Host "   ✅ .env файл создан с IP: $localIP" -ForegroundColor Green
} else {
    Write-Host "   ✅ .env файл уже существует" -ForegroundColor Green
}

# Шаг 2: Запуск Backend сервера
Write-Host ""
Write-Host "2. Запуск Backend сервера..." -ForegroundColor Yellow
Write-Host "   Сервер будет запущен в отдельном окне" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; Write-Host 'Backend Server starting on port 3001...' -ForegroundColor Green; npm start"

Start-Sleep -Seconds 3

# Шаг 3: Запуск Expo
Write-Host ""
Write-Host "3. Запуск Expo Dev Server..." -ForegroundColor Yellow
Write-Host "   После запуска отсканируйте QR код в приложении Expo Go" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

cd mobile
npx expo start --tunnel


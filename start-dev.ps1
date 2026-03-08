# MovieVerse Development Auto-Start Script
Write-Host "🚀 Starting MovieVerse Development Environment..." -ForegroundColor Green

# Kill existing processes
Write-Host "🔄 Cleaning up existing processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null

# Start Backend
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
Set-Location "c:\Users\hp\Desktop\Movie\MovieVerse\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start"

# Wait for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep 8

# Start Frontend
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Set-Location "c:\Users\hp\Desktop\Movie\MovieVerse\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "✅ Both servers started successfully!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5001" -ForegroundColor Cyan
Write-Host "🎬 Movie Details: http://localhost:5173/movie/[slug]" -ForegroundColor Cyan

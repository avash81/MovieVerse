# MovieVerse Automation Setup Script
Write-Host "🚀 Setting up MovieVerse Automation..." -ForegroundColor Green

# Create PowerShell Profile if it doesn't exist
$profilePath = $PROFILE.CurrentUserAllHosts
if (-not (Test-Path $profilePath)) {
    New-Item -Path $profilePath -ItemType File -Force
    Write-Host "📝 Created PowerShell profile" -ForegroundColor Yellow
}

# Add custom functions to profile
$profileContent = @'
# MovieVerse Auto-Commands
function Start-MovieVerse {
    Write-Host "🚀 Starting MovieVerse Development Environment..." -ForegroundColor Green
    
    # Kill existing processes
    taskkill /F /IM node.exe 2>$null
    
    # Start Backend
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\hp\Desktop\Movie\MovieVerse\backend; npm start"
    
    # Wait for backend
    Start-Sleep 5
    
    # Start Frontend  
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\hp\Desktop\Movie\MovieVerse\frontend; npm run dev"
    
    Write-Host "✅ MovieVerse started!" -ForegroundColor Green
    Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
    Write-Host "🔧 Backend: http://localhost:5001" -ForegroundColor Cyan
}

function Stop-MovieVerse {
    Write-Host "🛑 Stopping MovieVerse..." -ForegroundColor Red
    taskkill /F /IM node.exe 2>$null
    Write-Host "✅ All processes stopped!" -ForegroundColor Green
}

function Restart-MovieVerse {
    Write-Host "🔄 Restarting MovieVerse..." -ForegroundColor Yellow
    Stop-MovieVerse
    Start-Sleep 2
    Start-MovieVerse
}

function Fix-MovieVerse {
    Write-Host "🔧 Auto-fixing MovieVerse issues..." -ForegroundColor Yellow
    
    # Install dependencies
    Set-Location "c:\Users\hp\Desktop\Movie\MovieVerse\backend"
    npm install
    Set-Location "..\frontend"
    npm install
    
    # Clean npm cache
    npm cache clean --force
    
    # Restart
    Restart-MovieVerse
}

# Auto-completion for MovieVerse commands
Register-ArgumentCompleter -CommandName Start-MovieVerse -ParameterName Name -ScriptBlock {
    param($commandName, $parameterName, $wordToComplete, $commandAst, $fakeBoundParameter)
    @('dev', 'prod', 'backend', 'frontend') | Where-Object { $_ -like "$wordToComplete*" }
}
'@

# Add to profile if not already there
$currentProfile = Get-Content $profilePath -ErrorAction SilentlyContinue
if ($currentProfile -notmatch "Start-MovieVerse") {
    Add-Content -Path $profilePath -Value $profileContent
    Write-Host "✅ Added MovieVerse commands to PowerShell profile" -ForegroundColor Green
}

# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

Write-Host "✅ Automation setup complete!" -ForegroundColor Green
Write-Host "🔄 Restart PowerShell and use these commands:" -ForegroundColor Cyan
Write-Host "   Start-MovieVerse    - Start development environment" -ForegroundColor White
Write-Host "   Stop-MovieVerse     - Stop all processes" -ForegroundColor White  
Write-Host "   Restart-MovieVerse  - Restart development environment" -ForegroundColor White
Write-Host "   Fix-MovieVerse      - Auto-fix common issues" -ForegroundColor White

# Auto-start MovieVerse
Write-Host "🚀 Auto-starting MovieVerse..." -ForegroundColor Green
Start-MovieVerse

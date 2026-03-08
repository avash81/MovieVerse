@echo off
echo 🚀 Installing MovieVerse Automation...
echo.

REM Install PowerShell automation
powershell -ExecutionPolicy Bypass -File "setup-automation.ps1"

REM Install Node.js dependencies
echo 📦 Installing dependencies...
cd backend
call npm install
cd ..\frontend
call npm install

REM Create startup shortcut
echo 🔗 Creating startup shortcut...
powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\MovieVerse.lnk'); $Shortcut.TargetPath = 'powershell.exe'; $Shortcut.Arguments = '-NoExit -Command Start-MovieVerse'; $Shortcut.WorkingDirectory = '%CD%'; $Shortcut.Save()"

echo.
echo ✅ Automation installed successfully!
echo 🖱️  Double-click "MovieVerse" on desktop to start
echo 🔄 Or use PowerShell commands: Start-MovieVerse, Stop-MovieVerse, Restart-MovieVerse
echo.
pause

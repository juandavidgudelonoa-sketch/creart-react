@echo off
cd /d "%USERPROFILE%\OneDrive\Desktop\Carpinteria creart\creart-react"
npm run build
firebase deploy
pause

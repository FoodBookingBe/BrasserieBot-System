@echo off
echo Starting BrasserieBot AutoDev Dashboard...

cd /d %~dp0
echo Building dashboard frontend...
call npm run build:dashboard

echo Starting dashboard server...
start cmd /k npm run dashboard

echo Opening dashboard in browser...
timeout /t 3 > nul
start http://localhost:3030

echo Dashboard started successfully!
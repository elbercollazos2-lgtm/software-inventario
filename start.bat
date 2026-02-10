@echo off
echo ==========================================
echo    Software Inventario - Iniciar Sistema
echo ==========================================

echo Iniciando Backend...
start "Backend Server" cmd /k "cd backend && npm start"

echo Iniciando Frontend...
start "Frontend Client" cmd /k "cd frontend && npm run dev"

echo.
echo Sistema iniciado. No cierres las ventanas de consola.
echo El frontend deberia abrirse en tu navegador pronto.

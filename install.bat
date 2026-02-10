@echo off
echo ==========================================
echo    Software Inventario - Instalacion
echo ==========================================

REM Check if Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado. Por favor instalalo desde https://nodejs.org/
    pause
    exit /b
)

echo [INFO] Node.js detectado.

echo.
echo [1/3] Instalando dependencias del Backend...
cd backend
if not exist .env (
    if exist .env.example (
        echo [INFO] Creando archivo .env desde .env.example
        copy .env.example .env
    ) else (
        echo [WARN] No se encontro .env.example en backend.
    )
)
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion del backend.
    pause
    exit /b
)
cd ..

echo.
echo [2/3] Instalando dependencias del Frontend...
cd frontend
if not exist .env (
    if exist .env.example (
        echo [INFO] Creando archivo .env desde .env.example
        copy .env.example .env
    ) else (
        echo [WARN] No se encontro .env.example en frontend.
    )
)
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion del frontend.
    pause
    exit /b
)
cd ..

echo.
echo [3/3] Instalacion completada con exito!
echo.
echo Para iniciar el sistema, ejecuta 'start.bat'
pause

# Check for Administrator privileges
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Please run this script as Administrator!" -ForegroundColor Red
    Start-Sleep -s 2
    exit
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Software Inventario - Auto Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Function to check command availability
function Check-Command {
    param($name, $cmd)
    Write-Host "Checking for $name..." -NoNewline
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        Write-Host " [OK]" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host " [MISSING]" -ForegroundColor Red
        return $false
    }
}

# 1. Check Prerequisites
Write-Host "`n[1/4] Checking Prerequisites..." -ForegroundColor Yellow
if (-not (Check-Command "Node.js" "node")) {
    Write-Host "Node.js is required. Opening download page..."
    Start-Process "https://nodejs.org/"
    Pause
    exit
}
if (-not (Check-Command "Git" "git")) {
    Write-Host "Git is recommended but not strictly required for running." -ForegroundColor Gray
}

# 2. Setup Environment
Write-Host "`n[2/4] Setting up Environment..." -ForegroundColor Yellow
$backendEnv = "backend\.env"
$backendExample = "backend\.env.example"

if (-not (Test-Path $backendEnv)) {
    Write-Host "Creating backend .env file..."
    $envContent = @"
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=supermercado_db
DB_PORT=3306
JWT_SECRET=super_secret_key_99
"@
    Set-Content -Path $backendEnv -Value $envContent
    Write-Host "Created backend/.env with default values." -ForegroundColor Green
    Write-Host "NOTE: Check backend/.env to match your DB credentials (default port 3306)." -ForegroundColor Magenta
}
else {
    Write-Host "Backend .env already exists." -ForegroundColor Gray
}

# 2.5 Check Database Service (Basic check)
Write-Host "`n[2.5/4] Checking Database Service..." -ForegroundColor Yellow
if (Get-Service "mysql" -ErrorAction SilentlyContinue) {
    if ((Get-Service "mysql").Status -eq 'Running') {
        Write-Host "MySQL Service is RUNNING." -ForegroundColor Green
    }
    else {
        Write-Host "MySQL Service is STOPPED. Please start it!" -ForegroundColor Red
    }
}
else {
    Write-Host "MySQL service not found (typical for XAMPP or portable). Ensure it's running!" -ForegroundColor Yellow
}
Write-Host "REMINDER: You must manually create the database 'supermercado_db' in your SQL manager." -ForegroundColor Magenta

# 3. Install Backend
Write-Host "`n[3/4] Installing Backend Dependencies..." -ForegroundColor Yellow
Push-Location backend
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "Backend install failed!" -ForegroundColor Red; exit }
Pop-Location

# 4. Install Frontend
Write-Host "`n[4/4] Installing Frontend Dependencies..." -ForegroundColor Yellow
Push-Location frontend
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend install failed!" -ForegroundColor Red; exit }
Pop-Location

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete! Ready to Launch" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "To start the application, double-click 'start.bat'" -ForegroundColor Green
Pause

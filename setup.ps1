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

# 2.5 Check Database Service (Automated)
Write-Host "`n[2.5/4] Checking Database Service..." -ForegroundColor Yellow
$dbService = Get-Service "mysql" -ErrorAction SilentlyContinue
$dbInstalled = $false

if ($dbService) {
    if ($dbService.Status -eq 'Running') {
        Write-Host "MySQL Service is RUNNING." -ForegroundColor Green
        $dbInstalled = $true
    }
    else {
        Write-Host "MySQL Service is STOPPED. Attempting to start..." -ForegroundColor Yellow
        Start-Service "mysql"
        if ((Get-Service "mysql").Status -eq 'Running') {
            Write-Host "MySQL Service started successfully." -ForegroundColor Green
            $dbInstalled = $true
        }
        else {
            Write-Host "Failed to start MySQL Service. Please start it manually." -ForegroundColor Red
        }
    }
}
else {
    Write-Host "MySQL/MariaDB service not found." -ForegroundColor Yellow

    # Check if winget is available
    if (Get-Command "winget" -ErrorAction SilentlyContinue) {
        $choice = Read-Host "Do you want to install MariaDB automatically? (Y/N)"
        if ($choice -eq 'Y' -or $choice -eq 'y') {
            Write-Host "Installing MariaDB via Winget..." -ForegroundColor Cyan
            winget install -e --id MariaDB.MariaDB --silent --accept-package-agreements --accept-source-agreements

            # Update path to include new installation
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

            # Wait for service
            Start-Sleep -s 10
            if (Get-Service "mysql" -ErrorAction SilentlyContinue) {
                Write-Host "MariaDB Installed successfully." -ForegroundColor Green
                $dbInstalled = $true
            }
            else {
                Write-Host "MariaDB installed but service not detected yet. You may need to restart." -ForegroundColor Yellow
            }
        }
    }
    else {
        Write-Host "Winget not found. Cannot auto-install database." -ForegroundColor Red
    }
}

if ($dbInstalled) {
    # Attempt to create database if not exists
    Write-Host "Ensuring database 'supermercado_db' exists..."
    # Try using mysql command if available
    if (Get-Command "mysql" -ErrorAction SilentlyContinue) {
        mysql -u root -e "CREATE DATABASE IF NOT EXISTS supermercado_db;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database created/verified." -ForegroundColor Green

            # Run Migrations
            Write-Host "Running Database Migrations..."
            Push-Location backend
            node migrate.js
            Pop-Location
        }
        else {
            Write-Host "Could not connect to MySQL to create DB. Check credentials." -ForegroundColor Red
        }
    }
    else {
        Write-Host "MySQL command not found in PATH. Skipping DB creation." -ForegroundColor Yellow
    }
}
else {
    Write-Host "Skipping Database Setup (DB Server not found)." -ForegroundColor Gray
}

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

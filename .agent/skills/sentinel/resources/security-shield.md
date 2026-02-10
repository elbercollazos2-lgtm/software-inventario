# SENTINEL: Security & Integrity Shield

This script provides a first line of defense against common vulnerabilities and anti-patterns.

## Security Scanning Checklist (Manual/CI)
- [ ] **Secrets Check**: No API keys, passwords, or tokens in `.env` (unless ignored), `.json`, or `.js` files.
- [ ] **Package Audit**: Run `npm audit` or `yarn audit` for known CVEs.
- [ ] **Encryption**: Sensitive data must be encrypted before storage.
- [ ] **Input Sanitization**: All user input must be sanitized/validated before processing.

## Pre-Commit Hook Template (PowerShell)
```powershell
# .agent/skills/sentinel/scripts/pre-commit.ps1

Write-Host "🛡️ SENTINEL: Running Pre-Commit Integrity Checks..." -ForegroundColor Cyan

# 1. Complexity Check (Mock)
# In professional setups, use 'eslint --max-warnings 0'
# For now, SENTINEL reminds you: "No functions > 10 cyclomatic complexity"

# 2. Secret Scanning (Basic)
$SecretsFound = grep -rE "API_KEY|PASSWORD|SECRET_KEY|TOKEN" . | grep -v "node_modules" | grep -v ".env.example"
if ($SecretsFound) {
    Write-Error "❌ SENTINEL: Potential secrets found in code! Commit blocked."
    exit 1
}

# 3. Linting
# npm run lint

Write-Host "✅ SENTINEL: Integrity verified. Proceeding with commit." -ForegroundColor Green
```

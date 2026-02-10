param (
    [Parameter(Mandatory=$true)]
    [string]$SkillName
)

$BaseDir = Join-Path $PWD ".agent/skills/$SkillName"

if (Test-Path $BaseDir) {
    Write-Error "Skill '$SkillName' already exists at $BaseDir"
    return
}

Write-Host "Creating skill structure for '$SkillName'..."

# Create directories
New-Item -ItemType Directory -Path $BaseDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BaseDir "scripts") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BaseDir "examples") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BaseDir "resources") -Force | Out-Null

# Create SKILL.md template
$SkillMdContent = @"
---
name: $($SkillName -replace '-', ' ')
description: Briefly describe what this skill does.
---

# $($SkillName -replace '-', ' ')

## Overview
Describe the purpose and goals of this skill.

## Core Instructions
Detail the steps and rules for this skill.

## Examples
Provide markdown or code snippets showing the skill in action.
"@

$SkillMdPath = Join-Path $BaseDir "SKILL.md"
Set-Content -Path $SkillMdPath -Value $SkillMdContent

Write-Host "Skill '$SkillName' initialized successfully at $BaseDir"

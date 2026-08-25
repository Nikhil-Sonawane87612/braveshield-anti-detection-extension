<#
.SYNOPSIS
  BraveShield Bypass Pro — Release Packager
.DESCRIPTION
  Produces a clean, root-level distribution ZIP that loads directly via
  chrome://extensions -> "Load unpacked" after extraction (no nested-folder
  trap, no dev-only files).

  Usage:
    .\build.ps1                          # -> dist\BraveShield-v<version>.zip
    .\build.ps1 -WithUpdateUrl           # packed-CRX variant: injects
                                         # manifest update_url for self-hosted
                                         # auto-update via update.xml
.NOTES
  GitHub "Source code (ZIP)" downloads extract into a nested folder and ship
  dev-only files; always release using this script instead.
#>
[CmdletBinding()]
param(
  [switch]$WithUpdateUrl,
  [string]$OutputDir = 'dist'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $root

try {
  # ── Read version straight from the manifest (single source of truth) ──
  $manifest = Get-Content -Raw 'manifest.json' | ConvertFrom-Json
  $version = $manifest.version
  if (-not $version) { throw 'manifest.json has no version field' }
  Write-Host "[build] Packaging BraveShield v$version" -ForegroundColor Cyan

  # ── Files shipped inside the extension archive (all at archive ROOT) ──
  $include = @(
    'manifest.json',
    'background.js',
    'content.js',
    'inject.js',
    'hardware-profiles.js',
    'useragents.js',
    'rules.json',
    'popup.html', 'popup.css', 'popup.js',
    'options.html', 'options.css', 'options.js',
    'welcome.html', 'welcome.css', 'welcome.js'
  )
  $includeDirs = @('shared', 'icons')

  foreach ($f in $include) {
    if (-not (Test-Path $f)) { throw "Required file missing: $f" }
  }

  # ── Stage ──
  $stage = Join-Path ([System.IO.Path]::GetTempPath()) ("bs-build-" + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $stage | Out-Null
  foreach ($item in $include) { Copy-Item $item $stage }
  foreach ($dir in $includeDirs) {
    if (Test-Path $dir) { Copy-Item $dir -Destination $stage -Recurse }
  }

  # ── Optional: self-hosted auto-updater support for packed CRX installs ──
  if ($WithUpdateUrl) {
    $stagedManifestPath = Join-Path $stage 'manifest.json'
    $raw = Get-Content -Raw $stagedManifestPath
    # Strip any existing update_url, then inject ours after the author field
    $clean = ($raw -replace '"update_url"\s*:\s*"[^"]*"\s*,?\s*', '').TrimEnd()
    $updateUrl = 'https://raw.githubusercontent.com/Nikhil-Sonawane87612/braveshield-anti-detection-extension/main/update.xml'
    $clean = $clean -replace '"author"', ('"update_url": "' + $updateUrl + '",`n  "author"')
    Set-Content -Path $stagedManifestPath -Value $clean -Encoding UTF8
    Write-Host '[build] update_url injected (packed-CRX variant)' -ForegroundColor Yellow
  }

  # ── Sanity checks before zipping ──
  $check = Get-Content -Raw (Join-Path $stage 'manifest.json') | ConvertFrom-Json
  foreach ($req in @('background.js','content.js','inject.js')) {
    if (-not (Test-Path (Join-Path $stage $req))) { throw "$req missing from staging" }
  }
  if ($check.declarative_net_request.rule_resources[0].path -ne 'rules.json') {
    throw 'DNR ruleset path mismatch'
  }

  # ── Zip (root-level entries, no wrapper folder) ──
  if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Path $OutputDir | Out-Null }
  $zipName = Join-Path $OutputDir "BraveShield-v$version.zip"
  if (Test-Path $zipName) { Remove-Item $zipName -Force }

  Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zipName -CompressionLevel Optimal
  $sizeKb = [math]::Round((Get-Item $zipName).Length / 1KB)
  Write-Host "[build] Created $zipName (${sizeKb} KB)" -ForegroundColor Green
  Write-Host '[build] Verify: extract anywhere, then chrome://extensions -> Load unpacked -> select the extracted folder.' -ForegroundColor Gray
}
finally {
  Pop-Location
  if ($stage -and (Test-Path $stage)) { Remove-Item $stage -Recurse -Force }
}

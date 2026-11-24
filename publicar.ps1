# Publica la web de Dpar Diseños en Cloudflare Pages (proyecto "dpar" -> https://dpar.pages.dev).
# Uso, desde la carpeta del proyecto:  .\publicar.ps1
# Requiere haber iniciado sesión una vez con:  npx wrangler login

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host "1/3 Armando la carpeta dist..."
New-Item -ItemType Directory -Force dist, dist\img | Out-Null
Copy-Item index.html, 404.html, favicon.svg, manifest.webmanifest, share.jpg, sitemap.xml, robots.txt dist\ -Force
Copy-Item icons, js dist\ -Recurse -Force
if (Test-Path dist\img\w) { Remove-Item dist\img\w -Recurse -Force }
Copy-Item img\w dist\img\w -Recurse -Force

Write-Host "2/3 Revisando la sesión de Cloudflare..."
$who = npx wrangler whoami 2>&1 | Out-String
if ($who -match 'not authenticated') {
  Write-Host "No hay sesión. Corré 'npx wrangler login' y volvé a ejecutar este script." -ForegroundColor Yellow
  exit 1
}

Write-Host "3/3 Publicando..."
npx wrangler pages deploy dist --project-name dpar --branch main --commit-dirty=true

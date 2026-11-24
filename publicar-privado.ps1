# Publica la web de Dpar Diseños en modo PRIVADO (pide usuario y clave) en https://dpar.pages.dev
# Uso, desde la carpeta del proyecto:  .\publicar-privado.ps1
# Los datos de acceso están en acceso-privado.txt (no se suben a la web).
# Para abrirla al público cuando el cliente apruebe: borrar la carpeta "functions" y correr .\publicar.ps1

param([switch]$NuevaClave)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$who = npx wrangler whoami 2>&1 | Out-String
if ($who -match 'not authenticated') {
  Write-Host "No hay sesión de Cloudflare. Corré 'npx wrangler login' y volvé a ejecutar este script." -ForegroundColor Yellow
  exit 1
}

$txt = Get-Content acceso-privado.txt -Raw -Encoding utf8
if ($NuevaClave) {
  $chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'.ToCharArray()
  $b = New-Object byte[] 14; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  $nueva = -join ($b | ForEach-Object { $chars[$_ % $chars.Length] })
  $txt = $txt -replace '(?m)^Clave:\s+\S+', "Clave:     $nueva"
  Set-Content acceso-privado.txt $txt -Encoding utf8
}
$usuario = ([regex]::Match($txt, '(?m)^Usuario:\s+(\S+)')).Groups[1].Value
$clave   = ([regex]::Match($txt, '(?m)^Clave:\s+(\S+)')).Groups[1].Value
if (-not $usuario -or -not $clave) { throw "No encontré usuario y clave en acceso-privado.txt" }

Write-Host "1/3 Guardando usuario y clave en Cloudflare (secretos del proyecto)..."
$usuario | npx wrangler pages secret put ACCESO_USUARIO --project-name dpar
$clave   | npx wrangler pages secret put ACCESO_CLAVE --project-name dpar

Write-Host "2/3 Armando la carpeta dist..."
New-Item -ItemType Directory -Force dist, dist\img | Out-Null
Copy-Item index.html, 404.html, favicon.svg, manifest.webmanifest, share.jpg, sitemap.xml, robots.txt dist\ -Force
Copy-Item icons, js dist\ -Recurse -Force
if (Test-Path dist\img\w) { Remove-Item dist\img\w -Recurse -Force }
Copy-Item img\w dist\img\w -Recurse -Force

Write-Host "3/3 Publicando (privada)..."
npx wrangler pages deploy dist --project-name dpar --branch main --commit-dirty=true
Write-Host "Listo. Entrá a https://dpar.pages.dev con los datos de acceso-privado.txt" -ForegroundColor Green

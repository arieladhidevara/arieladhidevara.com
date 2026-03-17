param(
  [string]$AssetsRoot = "assets-local",
  [string]$Slug = "",
  [string]$Bucket = "",
  [string]$AccountId = "",
  [string]$AccessKeyId = "",
  [string]$SecretAccessKey = "",
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:AwsExecutable = ""
$script:AwsBaseArgs = @()
$script:GzipMetadataRules = @(
  @{ Include = "*.js.gz"; ContentType = "application/javascript" },
  @{ Include = "*.wasm.gz"; ContentType = "application/wasm" },
  @{ Include = "*.data.gz"; ContentType = "application/octet-stream" },
  @{ Include = "*.json.gz"; ContentType = "application/json" }
)

function Initialize-AwsCli {
  $awsV2Path = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
  if (Test-Path $awsV2Path -PathType Leaf) {
    $script:AwsExecutable = $awsV2Path
    $script:AwsBaseArgs = @()
    return
  }

  $awsCmd = Get-Command aws -ErrorAction SilentlyContinue
  if ($awsCmd) {
    $script:AwsExecutable = $awsCmd.Source
    $script:AwsBaseArgs = @()
    return
  }

  if (Get-Command python -ErrorAction SilentlyContinue) {
    $script:AwsExecutable = "python"
    $script:AwsBaseArgs = @("-m", "awscli")
    return
  }

  throw "AWS CLI not found. Install AWS CLI v2 first."
}

function Require-Value {
  param(
    [string]$Name,
    [string]$Value
  )
  if ([string]::IsNullOrWhiteSpace($Value)) {
    throw "Missing required value: $Name. Set env var $Name or pass as parameter."
  }
}

function Load-DotEnvFile {
  param(
    [string]$Path
  )

  if (-not (Test-Path $Path -PathType Leaf)) {
    return
  }

  foreach ($line in Get-Content $Path) {
    $trimmed = $line.Trim()
    if (-not $trimmed) { continue }
    if ($trimmed.StartsWith("#")) { continue }
    if ($trimmed -notmatch "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") { continue }

    $name = $matches[1]
    $value = $matches[2].Trim()

    if (
      ($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'"))
    ) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
      Set-Item -Path "Env:$name" -Value $value
    }
  }
}

function Run-Sync {
  param(
    [string]$Source,
    [string]$Destination,
    [string]$Endpoint,
    [bool]$DryRunEnabled
  )

  $args = @()
  $args += $script:AwsBaseArgs
  $args += @(
    "s3", "sync",
    $Source,
    $Destination,
    "--endpoint-url", $Endpoint,
    "--no-progress",
    "--only-show-errors"
  )

  if ($DryRunEnabled) {
    $args += "--dryrun"
  }

  Write-Host "Sync: $Source -> $Destination" -ForegroundColor Cyan
  & $script:AwsExecutable @args
  if ($LASTEXITCODE -ne 0) {
    throw "Sync failed for $Source (exit code $LASTEXITCODE)."
  }
}

function Set-GzipMetadata {
  param(
    [string]$Source,
    [string]$Destination,
    [string]$Endpoint,
    [bool]$DryRunEnabled
  )

  foreach ($rule in $script:GzipMetadataRules) {
    $args = @()
    $args += $script:AwsBaseArgs
    $args += @(
      "s3", "cp",
      $Source,
      $Destination,
      "--recursive",
      "--endpoint-url", $Endpoint,
      "--no-progress",
      "--only-show-errors",
      "--exclude", "*",
      "--include", $rule.Include,
      "--content-type", $rule.ContentType,
      "--content-encoding", "gzip",
      "--cache-control", "public, max-age=31536000, immutable"
    )

    if ($DryRunEnabled) {
      $args += "--dryrun"
    }

    Write-Host "Apply gzip metadata ($($rule.Include)): $Source -> $Destination" -ForegroundColor DarkCyan
    & $script:AwsExecutable @args
    if ($LASTEXITCODE -ne 0) {
      throw "Gzip metadata update failed for pattern $($rule.Include) (exit code $LASTEXITCODE)."
    }
  }
}

Initialize-AwsCli

$repoRoot = Split-Path $PSScriptRoot -Parent
$dotenvPath = Join-Path $repoRoot ".env.local"
Load-DotEnvFile -Path $dotenvPath

if ([string]::IsNullOrWhiteSpace($Bucket)) {
  $Bucket = $env:R2_BUCKET
}
if ([string]::IsNullOrWhiteSpace($AccountId)) {
  $AccountId = $env:R2_ACCOUNT_ID
}
if ([string]::IsNullOrWhiteSpace($AccessKeyId)) {
  $AccessKeyId = $env:R2_ACCESS_KEY_ID
}
if ([string]::IsNullOrWhiteSpace($SecretAccessKey)) {
  $SecretAccessKey = $env:R2_SECRET_ACCESS_KEY
}

Require-Value -Name "R2_BUCKET" -Value $Bucket
Require-Value -Name "R2_ACCOUNT_ID" -Value $AccountId
Require-Value -Name "R2_ACCESS_KEY_ID" -Value $AccessKeyId
Require-Value -Name "R2_SECRET_ACCESS_KEY" -Value $SecretAccessKey

$resolvedAssetsRoot = Resolve-Path $AssetsRoot
if (-not $resolvedAssetsRoot) {
  throw "Assets root not found: $AssetsRoot"
}

$assetsRootPath = $resolvedAssetsRoot.Path
$endpoint = "https://$AccountId.r2.cloudflarestorage.com"

$env:AWS_ACCESS_KEY_ID = $AccessKeyId
$env:AWS_SECRET_ACCESS_KEY = $SecretAccessKey
$env:AWS_DEFAULT_REGION = "auto"

if ($Slug) {
  $projectPath = Join-Path $assetsRootPath $Slug
  if (-not (Test-Path $projectPath -PathType Container)) {
    throw "Slug folder not found under assets root: $Slug"
  }

  $destination = "s3://$Bucket/$Slug"
  Run-Sync -Source $projectPath -Destination $destination -Endpoint $endpoint -DryRunEnabled $DryRun.IsPresent
  Set-GzipMetadata -Source $projectPath -Destination $destination -Endpoint $endpoint -DryRunEnabled $DryRun.IsPresent
  Write-Host "Done." -ForegroundColor Green
  exit 0
}

$projectDirs = Get-ChildItem -Path $assetsRootPath -Directory | Sort-Object Name
if ($projectDirs.Count -eq 0) {
  Write-Host "No project folders found in $assetsRootPath" -ForegroundColor Yellow
  exit 0
}

foreach ($dir in $projectDirs) {
  $destination = "s3://$Bucket/$($dir.Name)"
  Run-Sync -Source $dir.FullName -Destination $destination -Endpoint $endpoint -DryRunEnabled $DryRun.IsPresent
  Set-GzipMetadata -Source $dir.FullName -Destination $destination -Endpoint $endpoint -DryRunEnabled $DryRun.IsPresent
}

Write-Host "All project folders synced." -ForegroundColor Green

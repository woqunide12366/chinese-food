# ============================
# 老吃家美食网站 - Windows 一键部署脚本
# 用法: .\scripts\deploy.ps1
# ============================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

Set-Location $ProjectDir

Write-Host "🍜 老吃家美食网站 - Docker 部署" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# 1. 检查 Docker 环境
try {
    $dockerVersion = docker version --format '{{.Server.Version}}' 2>$null
    if (-not $dockerVersion) { throw "Docker 未运行" }
    Write-Host "✅ Docker 版本: $dockerVersion"
} catch {
    Write-Host "❌ 错误: Docker 未安装或未运行" -ForegroundColor Red
    exit 1
}

try {
    $composeVersion = docker compose version 2>$null
    if (-not $composeVersion) { throw "Docker Compose 未安装" }
    Write-Host "✅ $composeVersion"
    $useDockerCompose = $false
} catch {
    try {
        $composeV1 = docker-compose version 2>$null
        if (-not $composeV1) { throw }
        Write-Host "✅ $composeV1"
        $useDockerCompose = $true
    } catch {
        Write-Host "❌ 错误: Docker Compose 未安装" -ForegroundColor Red
        exit 1
    }
}

# 2. 加载环境变量（如果存在）
if (Test-Path ".env") {
    Write-Host "📋 加载环境变量..."
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
}

# 3. 创建必要目录
Write-Host "📁 创建数据目录..."
New-Item -ItemType Directory -Force -Path data, uploads, backups | Out-Null

# 4. 备份现有数据（如果数据库存在）
if (Test-Path "data/data.db") {
    Write-Host "💾 备份现有数据..."
    if (Test-Path "scripts/backup.ps1") {
        & "$ScriptDir/backup.ps1"
    }
}

# 5. 构建并启动服务
Write-Host "🐳 构建并启动容器..."
if ($useDockerCompose) {
    docker-compose down
    docker-compose up --build -d
} else {
    docker compose down
    docker compose up --build -d
}

# 6. 等待服务就绪
Write-Host "⏳ 等待服务就绪..."
$maxRetries = 30
$retry = 0
$ready = $false

while ($retry -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/api/submissions" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {
        # 继续等待
    }
    $retry++
    Write-Host "  等待中... ($retry/$maxRetries)"
    Start-Sleep -Seconds 2
}

if (-not $ready) {
    Write-Host "⚠️  服务启动超时，请检查日志:" -ForegroundColor Yellow
    if ($useDockerCompose) {
        docker-compose logs --tail=50 app
    } else {
        docker compose logs --tail=50 app
    }
    exit 1
}

Write-Host "✅ 服务已就绪！" -ForegroundColor Green

# 7. 清理旧镜像
Write-Host "🧹 清理未使用的镜像..."
docker image prune -f >$null 2>&1

# 8. 显示状态
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "🎉 部署完成！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 访问地址:"
Write-Host "   - HTTP:  http://localhost"
Write-Host "   - API:   http://localhost/api"
Write-Host ""
Write-Host "📊 容器状态:"
if ($useDockerCompose) {
    docker-compose ps
} else {
    docker compose ps
}
Write-Host ""
Write-Host "📜 常用命令:"
Write-Host "   查看日志: docker compose logs -f app"
Write-Host "   停止服务: docker compose down"
Write-Host "   备份数据: .\scripts\backup.ps1"
Write-Host ""

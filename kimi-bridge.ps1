# Kimi Bridge Agent v2 - PowerShell Script
# Otomatik dosya yazma, komut çalıştırma, git push
# Çalıştır: .   kimi-bridge.ps1

param(
    [int]$Port = 3456,
    [string]$ProjectDir = "D:\AI-Hub-v3"
)

Write-Host "🚀 Kimi Bridge Agent v2 başlatılıyor..." -ForegroundColor Cyan
Write-Host "📁 Proje Dizini: $ProjectDir" -ForegroundColor Cyan
Write-Host "🌐 Port: $Port" -ForegroundColor Cyan
Write-Host ""

# HttpListener oluştur
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "✅ Kimi Bridge Agent çalışıyor: http://localhost:$Port" -ForegroundColor Green
Write-Host "📌 Durdurmak için Ctrl+C basın" -ForegroundColor Yellow
Write-Host ""
Write-Host "Endpoints:" -ForegroundColor Yellow
Write-Host "  POST /write       - Dosya yaz" -ForegroundColor Gray
Write-Host "  POST /batch-write - Çoklu dosya yaz" -ForegroundColor Gray
Write-Host "  GET  /read        - Dosya oku" -ForegroundColor Gray
Write-Host "  POST /run-command - Komut çalıştır" -ForegroundColor Gray
Write-Host "  POST /git-push    - GitHub'a push et" -ForegroundColor Gray
Write-Host "  GET  /lint        - Lint çalıştır" -ForegroundColor Gray
Write-Host "  GET  /test        - Test çalıştır" -ForegroundColor Gray
Write-Host "  GET  /status      - Durum bilgisi" -ForegroundColor Gray
Write-Host ""

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    # CORS Headers
    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")

    if ($request.HttpMethod -eq "OPTIONS") {
        $response.StatusCode = 200
        $response.Close()
        continue
    }

    $url = $request.Url.PathAndQuery
    Write-Host "📨 $($request.HttpMethod) $url" -ForegroundColor Gray

    try {
        # Request body oku (POST için)
        $body = ""
        if ($request.HttpMethod -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $body = $reader.ReadToEnd()
            $reader.Close()
        }

        if ($request.HttpMethod -eq "POST" -and $url -eq "/write") {
            $data = $body | ConvertFrom-Json
            $filePath = $data.filePath
            $content = $data.content

            $fullPath = Join-Path $ProjectDir $filePath

            # Güvenlik kontrolü
            $resolvedProject = (Resolve-Path $ProjectDir).Path
            $resolvedFullPath = (Resolve-Path (Split-Path $fullPath -Parent) -ErrorAction SilentlyContinue).Path

            if (-not $resolvedFullPath -or -not $resolvedFullPath.StartsWith($resolvedProject)) {
                throw "Access denied: $filePath"
            }

            # Klasör oluştur
            $dir = Split-Path $fullPath -Parent
            if (-not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
            }

            # Dosyayı yaz
            $content | Out-File $fullPath -Encoding UTF8 -Force

            $result = @{ success = $true; path = $fullPath; bytes = $content.Length }
            Write-Host "✅ Yazıldı: $filePath" -ForegroundColor Green
        }
        elseif ($request.HttpMethod -eq "POST" -and $url -eq "/batch-write") {
            # Çoklu dosya yazma
            $data = $body | ConvertFrom-Json
            $files = $data.files
            $written = @()

            foreach ($file in $files) {
                $filePath = $file.path
                $content = $file.content
                $fullPath = Join-Path $ProjectDir $filePath

                $dir = Split-Path $fullPath -Parent
                if (-not (Test-Path $dir)) {
                    New-Item -ItemType Directory -Path $dir -Force | Out-Null
                }

                $content | Out-File $fullPath -Encoding UTF8 -Force
                $written += $filePath
                Write-Host "✅ Yazıldı: $filePath" -ForegroundColor Green
            }

            $result = @{ success = $true; files = $written; count = $written.Count }
        }
        elseif ($request.HttpMethod -eq "GET" -and $url.StartsWith("/read")) {
            $query = [System.Web.HttpUtility]::ParseQueryString($request.Url.Query)
            $filePath = $query["path"]
            $fullPath = Join-Path $ProjectDir $filePath

            if (-not (Test-Path $fullPath)) {
                throw "File not found: $filePath"
            }

            $content = Get-Content $fullPath -Raw -Encoding UTF8
            $result = @{ content = $content }
            Write-Host "📖 Okundu: $filePath" -ForegroundColor Blue
        }
        elseif ($request.HttpMethod -eq "POST" -and $url -eq "/run-command") {
            # Komut çalıştır
            $data = $body | ConvertFrom-Json
            $command = $data.command
            $cwd = if ($data.cwd) { $data.cwd } else { $ProjectDir }

            Write-Host "⚡ Komut: $command" -ForegroundColor Magenta

            $psi = New-Object System.Diagnostics.ProcessStartInfo
            $psi.FileName = "powershell.exe"
            $psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -Command `"$command`""
            $psi.WorkingDirectory = $cwd
            $psi.RedirectStandardOutput = $true
            $psi.RedirectStandardError = $true
            $psi.UseShellExecute = $false

            $process = [System.Diagnostics.Process]::Start($psi)
            $stdout = $process.StandardOutput.ReadToEnd()
            $stderr = $process.StandardError.ReadToEnd()
            $process.WaitForExit()

            $result = @{
                success = ($process.ExitCode -eq 0)
                exitCode = $process.ExitCode
                stdout = $stdout
                stderr = $stderr
            }

            if ($process.ExitCode -eq 0) {
                Write-Host "✅ Komut başarılı" -ForegroundColor Green
            } else {
                Write-Host "❌ Komut hatası: $($process.ExitCode)" -ForegroundColor Red
            }
        }
        elseif ($request.HttpMethod -eq "POST" -and $url -eq "/git-push") {
            # Git push otomatik
            $data = $body | ConvertFrom-Json
            $message = if ($data.message) { $data.message } else { "Auto update from Kimi Bridge" }

            Write-Host "🔄 Git push başlatılıyor..." -ForegroundColor Cyan

            # Git komutları
            $commands = @"
cd "$ProjectDir"
git add .
git commit -m "$message" 2>&1
git push origin main 2>&1
"@

            $psi = New-Object System.Diagnostics.ProcessStartInfo
            $psi.FileName = "powershell.exe"
            $psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -Command `"$commands`""
            $psi.WorkingDirectory = $ProjectDir
            $psi.RedirectStandardOutput = $true
            $psi.RedirectStandardError = $true
            $psi.UseShellExecute = $false

            $process = [System.Diagnostics.Process]::Start($psi)
            $stdout = $process.StandardOutput.ReadToEnd()
            $stderr = $process.StandardError.ReadToEnd()
            $process.WaitForExit()

            $result = @{
                success = ($process.ExitCode -eq 0)
                exitCode = $process.ExitCode
                output = $stdout
                error = $stderr
                message = $message
            }

            if ($process.ExitCode -eq 0) {
                Write-Host "✅ Git push başarılı!" -ForegroundColor Green
            } else {
                Write-Host "❌ Git push hatası" -ForegroundColor Red
            }
        }
        elseif ($request.HttpMethod -eq "GET" -and $url -eq "/lint") {
            $lintOutput = & npm run lint 2>&1 | Out-String
            $result = @{ lint = $lintOutput }
            Write-Host "🔍 Lint çalıştırıldı" -ForegroundColor Magenta
        }
        elseif ($request.HttpMethod -eq "GET" -and $url -eq "/test") {
            $testOutput = & npm run test 2>&1 | Out-String
            $result = @{ test = $testOutput }
            Write-Host "🧪 Test çalıştırıldı" -ForegroundColor Magenta
        }
        elseif ($request.HttpMethod -eq "GET" -and $url -eq "/status") {
            $result = @{
                status = "running"
                version = "2.0"
                project = $ProjectDir
                port = $Port
                time = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            }
        }
        else {
            $result = @{ error = "Not found: $url" }
            $response.StatusCode = 404
        }
    }
    catch {
        $result = @{ error = $_.Exception.Message }
        $response.StatusCode = 500
        Write-Host "❌ Hata: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Response gönder
    $json = $result | ConvertTo-Json -Depth 10
    $buffer = [System.Text.Encoding]::UTF8.GetBytes($json)
    $response.ContentType = "application/json"
    $response.ContentLength64 = $buffer.Length
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.OutputStream.Close()
    $response.Close()
}

$listener.Stop()
Write-Host "🛑 Kimi Bridge Agent durduruldu" -ForegroundColor Red
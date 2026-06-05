
# Kimi Bridge Agent - PowerShell Script
# Bu script, Kimi WebBridge'in yerel dosyalara yazmasını sağlar
# Çalıştır: .	kimi-bridge.ps1

param(
    [int]$Port = 3456,
    [string]$ProjectDir = "D:\AI-Hub-v3"
)

Write-Host "🚀 Kimi Bridge Agent başlatılıyor..." -ForegroundColor Cyan
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
        if ($request.HttpMethod -eq "POST" -and $url -eq "/write") {
            # Request body oku
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $body = $reader.ReadToEnd()
            $reader.Close()

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
        elseif ($request.HttpMethod -eq "GET" -and $url -eq "/lint") {
            # Lint çalıştır
            $lintOutput = & npm run lint 2>&1 | Out-String
            $result = @{ lint = $lintOutput }
            Write-Host "🔍 Lint çalıştırıldı" -ForegroundColor Magenta
        }
        elseif ($request.HttpMethod -eq "GET" -and $url -eq "/test") {
            # Test çalıştır
            $testOutput = & npm run test 2>&1 | Out-String
            $result = @{ test = $testOutput }
            Write-Host "🧪 Test çalıştırıldı" -ForegroundColor Magenta
        }
        elseif ($request.HttpMethod -eq "GET" -and $url -eq "/status") {
            $result = @{ 
                status = "running"
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

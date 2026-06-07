# AI Hub v3 - Tam Otomatik Ajan v2
$projectDir = "D:\AI-Hub-v3"

function Auto-Push {
    Set-Location $projectDir
    
    Write-Host "🧪 Test calistiriliyor..."
    npm test > test.log 2>&1
    $testResult = $LASTEXITCODE
    
    if ($testResult -ne 0) {
        Write-Host "❌ Test basarisiz!"
        Write-Host "Hatalar:"
        Get-Content test.log | Select-String "FAIL|Error|expected|AssertionError"
        return
    }
    Write-Host "✅ Test gecti"
    
    Write-Host "🔍 Lint calistiriliyor..."
    npm run lint > lint.log 2>&1
    $lintResult = $LASTEXITCODE
    
    if ($lintResult -ne 0) {
        Write-Host "❌ Lint basarisiz!"
        Write-Host "Hatalar:"
        Get-Content lint.log
        return
    }
    Write-Host "✅ Lint gecti"
    
    Write-Host "💾 Otomatik push..."
    git add .
    git commit -m "🤖 Auto: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git push origin main
    Write-Host "✅ Push tamam!"
}

# Tek seferlik calistir
Write-Host "Otomatik islem basliyor..."
Auto-Push
Write-Host "Bitti. Cikmak icin Enter'a bas."
Read-Host

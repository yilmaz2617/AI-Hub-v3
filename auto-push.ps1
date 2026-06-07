# AI Hub v3 - Tam Otomatik Ajan
$projectDir = "D:\AI-Hub-v3"

function Auto-Push {
    Set-Location $projectDir
    
    Write-Host "🧪 Test calistiriliyor..."
    npm test > test.log 2>&1
    $testResult = $LASTEXITCODE
    
    if ($testResult -ne 0) {
        Write-Host "❌ Test basarisiz! Push iptal."
        Write-Host "Hatalar:"
        Get-Content test.log | Select-String "FAIL|Error|expected"
        return
    }
    
    Write-Host "✅ Test gecti"
    
    Write-Host "🔍 Lint calistiriliyor..."
    npm run lint > lint.log 2>&1
    $lintResult = $LASTEXITCODE
    
    if ($lintResult -ne 0) {
        Write-Host "❌ Lint basarisiz! Push iptal."
        Get-Content lint.log | Select-String "error"
        return
    }
    
    Write-Host "✅ Lint gecti"
    
    Write-Host "💾 Otomatik push yapiliyor..."
    git add .
    git commit -m "🤖 Auto: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git push origin main
    
    Write-Host "✅ Push tamam! GitHub Actions calisiyor..."
}

# Her 5 dakikada kontrol et
while ($true) {
    $status = git status --short
    if ($status) {
        Write-Host "Degisiklik bulundu! Otomatik islem basliyor..."
        Auto-Push
    }
    Start-Sleep -Seconds 300  # 5 dakika bekle
}

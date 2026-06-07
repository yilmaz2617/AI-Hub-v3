# AI Hub v3 - Otomatik Ajan v3
$projectDir = "D:\AI-Hub-v3"

function Run-Test {
    Set-Location $projectDir
    Write-Host "Test calistiriliyor..."
    npm test 2>&1 | Tee-Object -Variable testOutput
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -ne 0) {
        Write-Host "TEST HATALARI:"
        Write-Host $testOutput | Select-String "FAIL|Error|expected|AssertionError|Cannot find"
    }
    return $exitCode
}

function Run-Lint {
    Set-Location $projectDir
    Write-Host "Lint calistiriliyor..."
    npm run lint 2>&1 | Tee-Object -Variable lintOutput
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -ne 0) {
        Write-Host "LINT HATALARI:"
        Write-Host $lintOutput | Select-String "error|warning"
    }
    return $exitCode
}

function Run-Push {
    Set-Location $projectDir
    Write-Host "Kaydediliyor..."
    git add .
    git commit -m "Auto: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git push origin main
    Write-Host "Tamam"
}

function Run-Full {
    Write-Host "=== TEST BASLIYOR ==="
    $testResult = Run-Test
    if ($testResult -ne 0) {
        Write-Host "❌ Test basarisiz! Push iptal."
        Write-Host "Hata detayini yukarida gorebilirsin."
        return
    }
    
    Write-Host "=== LINT BASLIYOR ==="
    $lintResult = Run-Lint
    if ($lintResult -ne 0) {
        Write-Host "❌ Lint basarisiz! Push iptal."
        return
    }
    
    Write-Host "=== PUSH BASLIYOR ==="
    Run-Push
}

while ($true) {
    Write-Host ""
    Write-Host "AI Hub v3 Ajan v3"
    Write-Host "1 - Test (Detayli)"
    Write-Host "2 - Lint (Detayli)"
    Write-Host "3 - Test + Lint + Push"
    Write-Host "4 - Sadece Push"
    Write-Host "5 - Cikis"
    
    $secim = Read-Host "Secim"
    
    if ($secim -eq "1") { Run-Test }
    elseif ($secim -eq "2") { Run-Lint }
    elseif ($secim -eq "3") { Run-Full }
    elseif ($secim -eq "4") { Run-Push }
    elseif ($secim -eq "5") { Write-Host "Gorusuruz"; exit }
    else { Write-Host "Gecersiz secim" }
}

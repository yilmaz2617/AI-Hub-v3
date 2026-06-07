# AI Hub v3 - Otomatik Ajan
$projectDir = "D:\AI-Hub-v3"

function Run-Test {
    Set-Location $projectDir
    Write-Host "Test calistiriliyor..."
    npm test
    return $LASTEXITCODE
}

function Run-Lint {
    Set-Location $projectDir
    Write-Host "Lint calistiriliyor..."
    npm run lint
    return $LASTEXITCODE
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
    $testResult = Run-Test
    if ($testResult -ne 0) {
        Write-Host "Test basarisiz! Push iptal."
        return
    }
    
    $lintResult = Run-Lint
    if ($lintResult -ne 0) {
        Write-Host "Lint basarisiz! Push iptal."
        return
    }
    
    Run-Push
}

while ($true) {
    Write-Host ""
    Write-Host "AI Hub v3 Ajan"
    Write-Host "1 - Test"
    Write-Host "2 - Lint"
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

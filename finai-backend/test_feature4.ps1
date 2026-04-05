# ============================================
# Feature 4 - DynamoDB Profile Sync Test
# Run: .\test_feature4.ps1
# ============================================

$BASE_URL = "http://localhost:8001"
$TEST_USER = "test-user-001"

function Pass($msg) { Write-Host "PASS - $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "FAIL - $msg" -ForegroundColor Red }
function Info($msg) { Write-Host ">> $msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Incuverse Feature 4 - Profile Sync Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend reachable
Info "Test 1: Backend health check"
try {
    $r = Invoke-WebRequest -Uri "$BASE_URL/docs" -UseBasicParsing -ErrorAction Stop
    if ($r.StatusCode -eq 200) { Pass "Backend is running on port 8001" }
} catch {
    Fail "Backend not reachable. Run: uvicorn main:app --port 8001 --reload"
    exit 1
}

Write-Host ""

# Test 2: Save profile
Info "Test 2: Save profile (POST)"
$body = @{
    profile_data = @{
        age              = 30
        annual_income    = 1200000
        monthly_expenses = 60000
        current_savings  = 500000
        monthly_savings  = 25000
        location         = "Mumbai, India"
    }
} | ConvertTo-Json -Depth 3

try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/profile/$TEST_USER" -Method POST -ContentType "application/json" -Body $body
    Write-Host "   Response: $($r | ConvertTo-Json -Compress)"
    if ($r.success -eq $true) { Pass "Profile saved to DynamoDB" }
    else { Fail "Save failed. Check AWS keys and DynamoDB table name in .env" }
} catch {
    Fail "POST request failed: $_"
}

Write-Host ""

# Test 3: Load profile
Info "Test 3: Load profile (GET)"
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/profile/$TEST_USER" -Method GET
    Write-Host "   Response: $($r | ConvertTo-Json -Compress)"
    if ($r.success -eq $true) { Pass "Profile loaded from DynamoDB" }
    else { Fail "Load failed. Profile may not have saved correctly" }
} catch {
    Fail "GET request failed: $_"
}

Write-Host ""

# Test 4: Data integrity
Info "Test 4: Data integrity check"
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/profile/$TEST_USER" -Method GET
    if ($r.profile.location -like "*Mumbai*") { Pass "Profile data is correct (location matches)" }
    else { Fail "Data mismatch. Saved and loaded data do not match" }
} catch {
    Fail "Request failed: $_"
}

Write-Host ""

# Test 5: Missing user returns null
Info "Test 5: Missing user returns null profile"
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/profile/nobody-xyz-999" -Method GET
    Write-Host "   Response: $($r | ConvertTo-Json -Compress)"
    if ($r.success -eq $false -and $null -eq $r.profile) { Pass "Missing user returns null correctly" }
    else { Fail "Expected success=false and profile=null" }
} catch {
    Fail "Request failed: $_"
}

Write-Host ""

# Test 6: Upsert (update existing)
Info "Test 6: Update existing profile (upsert)"
$updateBody = @{
    profile_data = @{
        age           = 31
        annual_income = 1500000
        location      = "Bangalore, India"
    }
} | ConvertTo-Json -Depth 3

try {
    Invoke-RestMethod -Uri "$BASE_URL/api/profile/$TEST_USER" -Method POST -ContentType "application/json" -Body $updateBody | Out-Null
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/profile/$TEST_USER" -Method GET
    if ($r.profile.location -like "*Bangalore*") { Pass "Profile updated (upsert working correctly)" }
    else { Fail "Upsert failed. Old data still showing" }
} catch {
    Fail "Request failed: $_"
}

Write-Host ""

# Test 7: Demo user
Info "Test 7: Demo user profile"
$demoBody = @{
    profile_data = @{
        firstName     = "Raj"
        lastName      = "Kumar"
        age           = 30
        location      = "Mumbai, India"
        monthlyIncome = 100000
    }
} | ConvertTo-Json -Depth 3

try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/profile/demo-user-1" -Method POST -ContentType "application/json" -Body $demoBody
    if ($r.success -eq $true) { Pass "Demo user profile saved" }
    else { Fail "Demo user save failed" }
} catch {
    Fail "Request failed: $_"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  All tests complete." -ForegroundColor Cyan
Write-Host "  Check AWS DynamoDB console to confirm" -ForegroundColor Cyan
Write-Host "  items exist in: incuverse-profiles" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
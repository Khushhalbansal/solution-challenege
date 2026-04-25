Write-Host "==============================================================="
Write-Host " 🌐 NEXUS-FLOW AI: SYSTEM INITIALIZATION SCRIPT "
Write-Host "==============================================================="

# 1. Seed Config Data
Write-Host "[1/4] Checking Network State-Space Configuration..."
if (Test-Path -Path "nexus_flow\network_config.json") {
    Copy-Item -Path "nexus_flow\network_config.json" -Destination "nexus-core\network_config.json" -Force
    Write-Host "  -> Successfully seeded LAX and Rotterdam constraints into /nexus-core"
}

# 2. Python Backend Setup
Write-Host "`n[2/4] Installing Python Core Engine Dependencies..."
pip install -r requirements.txt

# 3. React Frontend Setup
Write-Host "`n[3/4] Installing React UI Dependencies..."
Set-Location -Path "nexus-ui"
npm install
Set-Location -Path ".."

# 4. Launch Sequence
Write-Host "`n[4/4] Engaging Simultaneous Launch Sequence..."

# Start Backend Mock API as a background process
Write-Host "  -> Booting Central Intelligence API (FastAPI)..."
Start-Process -FilePath "python" -ArgumentList "nexus-core\mock_api.py"

# Give the API 2 seconds to bind to the port
Start-Sleep -Seconds 2

# Start Frontend Dashboard (this will bind to the active terminal window)
Write-Host "  -> Booting Tactical Dashboard (Vite/React)..."
Set-Location -Path "nexus-ui"
npm run dev

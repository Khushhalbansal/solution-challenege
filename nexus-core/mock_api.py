from fastapi import FastAPI, HTTPException
import uvicorn
import random
import time

app = FastAPI(title="Nexus-Flow ERP & Carrier Mock API", version="1.0")

START_TIME = time.time()

@app.post("/reroute")
async def execute_reroute(payload: dict):
    carrier = payload.get("carrier_id")
    route = payload.get("route_id")
    
    if not carrier or not route:
        raise HTTPException(status_code=400, detail="Missing required parameters")
    
    return {
        "status": "success",
        "action": f"Carrier {carrier} rerouted to {route}",
        "estimated_impact_delay": f"+{random.uniform(0.5, 3.5):.1f} days",
        "api_security": "mTLS 1.3 Verified"
    }

@app.get("/tracking")
async def get_gps_tracking(shipment_id: str):
    """Simulates real-time GPS tracking data."""
    elapsed_days = (time.time() - START_TIME) * 1.5 # Time compression for demo
    predicted = 5.0
    
    # Introduce an artificial delay spike after a set period to trigger the logic drift
    actual = elapsed_days
    if elapsed_days > 3.0:
        actual += random.uniform(1.2, 2.5) 
        
    return {
        "shipment_id": shipment_id,
        "predicted_latency_days": predicted,
        "current_latency_days": round(actual, 2),
        "status": "IN_TRANSIT"
    }

@app.post("/gemini/re-optimize")
async def trigger_reoptimization(payload: dict):
    """Mock endpoint for the Gemini Pro Thinking re-optimization hook."""
    return {
        "status": "ACKNOWLEDGED",
        "message": "Gemini Pro Thinking initiated 1,000+ Monte Carlo recalculations.",
        "received_data": payload
    }

@app.get("/status")
async def get_system_status():
    return {
        "network_status": "ONLINE",
        "api_health": "OPTIMAL"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

import time
import csv
import requests
import os

API_URL = "http://127.0.0.1:8000"
CSV_FILE = "latency_variances.csv"
POLL_INTERVAL_SECONDS = 2.0

def init_csv():
    """Initializes the CSV ledger for hackathon presentation data."""
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([
                "timestamp", "shipment_id", "predicted_latency", 
                "current_latency", "variance_percentage", "action_taken"
            ])

def log_to_csv(shipment_id, predicted, current, variance, action):
    """Appends variance data for Ralph Loop ingestion."""
    with open(CSV_FILE, mode='a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            time.time(), shipment_id, predicted, current, 
            round(variance * 100, 2), action
        ])
    print(f" [CSV LOG] Data exported. Action: {action}")

def poll_shipment(shipment_id):
    """Polls the API and triggers Gemini Pro Thinking on Logic Drift."""
    try:
        response = requests.get(f"{API_URL}/tracking", params={"shipment_id": shipment_id})
        
        if response.status_code == 200:
            data = response.json()
            predicted = data['predicted_latency_days']
            current = data['current_latency_days']
            
            print(f"\n[@GSD Tracker] Polling {shipment_id} | Actual: {current}d vs Predicted: {predicted}d")
            
            variance = (current - predicted) / predicted
            
            # Guardrail: 15% Logic Drift
            if variance > 0.15:
                print(f" 🚨 [CRITICAL ALERT] Latency Variance {variance*100:.1f}% exceeds 15% baseline!")
                print(" 🔄 Executing POST to @Gemini Pro Thinking /re-optimize endpoint...")
                
                payload = {
                    "shipment_id": shipment_id,
                    "variance": variance,
                    "current_latency": current
                }
                
                gemini_res = requests.post(f"{API_URL}/gemini/re-optimize", json=payload)
                print(f" [HUB RESPONSE] {gemini_res.json()['message']}")
                
                log_to_csv(shipment_id, predicted, current, variance, "TRIGGERED_REOPTIMIZATION")
            else:
                print(f" ✅ Status Nominal. Variance tracking at {variance*100:.1f}%.")
                log_to_csv(shipment_id, predicted, current, variance, "NOMINAL")
                
    except requests.exceptions.ConnectionError:
        print("[!] Connection Error: Ensure mock_api.py is running on port 8000.")

def start_monitor_loop():
    print("===============================================================")
    print(" [GSD] Continuous GPS Tracking Monitor Started ")
    print("===============================================================")
    init_csv()
    
    shipment_to_track = "SHP-OCEAN-8992"
    
    # Continuous polling loop
    try:
        while True:
            poll_shipment(shipment_to_track)
            time.sleep(POLL_INTERVAL_SECONDS)
    except KeyboardInterrupt:
        print("\n[GSD] Monitor shutting down. Logs saved to latency_variances.csv.")

if __name__ == "__main__":
    start_monitor_loop()

import time
import random

def poll_iot_edge_devices():
    """
    Simulates polling IoT edge devices for real-time telemetry 
    (e.g., GPS coordinates, container temperature, vibrations).
    """
    print("[DATA INTEGRATION] Polling IoT Edge Devices...")
    # Simulated JSON payload from Edge device
    telemetry = {
        "timestamp": time.time(),
        "device_id": "EDGE-104",
        "location": {"lat": 34.0522, "lon": -118.2437},
        "status": "IN_TRANSIT",
        "vibration_index": random.uniform(0.1, 0.9),
        "anomaly_detected": random.choice([True, False])
    }
    return telemetry

def fetch_erp_inventory_levels():
    """
    Simulates fetching current inventory levels and open purchase orders
    from the ERP system.
    """
    print("[DATA INTEGRATION] Fetching ERP Inventory Data...")
    return {
        "node_LAX": {"stock": 1500, "capacity": 2000},
        "node_JFK": {"stock": 320, "capacity": 1500},
        "node_ORD": {"stock": 800, "capacity": 1000}
    }

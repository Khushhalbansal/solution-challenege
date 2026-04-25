import json
import time
import asyncio

LOG_FILE = "system_of_record.jsonl"

async def log_action(action_type, parameters, status="PENDING", logic_reference=""):
    """
    Logs execution actions asynchronously for the Ralph Loop to audit later.
    Immutable, append-only log to ensure complete traceability.
    """
    record = {
        "timestamp": time.time(),
        "action_type": action_type,
        "parameters": parameters,
        "status": status,
        "logic_reference": logic_reference
    }
    
    # Asynchronous context to prevent blocking GSD Engine's event loop
    await asyncio.sleep(0.001) # Simulate non-blocking I/O
    
    # Atomic append
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(record) + "\n")
        
    print(f"[SYSTEM OF RECORD] Logged: {action_type} | Status: {status} | Ref: {logic_reference}")

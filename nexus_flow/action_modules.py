import asyncio
from system_of_record import log_action

async def reRoute(carrier_id, route_id, logic_reference="Gemini_Pro_Final_Logic"):
    """
    Reroutes a carrier to a new route to bypass predicted bottlenecks.
    """
    print(f"\n[ACTION MODULE] Initiating reRoute... (Carrier: {carrier_id} -> Route: {route_id})")
    await asyncio.sleep(0.05) # Simulate external API latency
    await log_action("reRoute", {"carrier_id": carrier_id, "route_id": route_id}, "EXECUTED", logic_reference)
    return True

async def rebalanceInventory(source_node, dest_node, quantity, logic_reference="Gemini_Pro_Final_Logic"):
    """
    Rebalances inventory between two nodes to prevent stockouts.
    """
    print(f"\n[ACTION MODULE] Initiating rebalanceInventory... ({quantity} units: {source_node} -> {dest_node})")
    await asyncio.sleep(0.05)
    await log_action("rebalanceInventory", {"source_node": source_node, "dest_node": dest_node, "quantity": quantity}, "EXECUTED", logic_reference)
    return True

async def triggerEmergencySourcing(supplier_id, logic_reference="Gemini_Pro_Final_Logic"):
    """
    Triggers emergency sourcing from an alternative supplier.
    """
    print(f"\n[ACTION MODULE] Initiating triggerEmergencySourcing... (Supplier: {supplier_id})")
    await asyncio.sleep(0.05)
    await log_action("triggerEmergencySourcing", {"supplier_id": supplier_id}, "EXECUTED", logic_reference)
    return True

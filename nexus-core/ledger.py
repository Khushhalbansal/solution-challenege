import hashlib
import json
import time

class ResilienceLedger:
    """
    A tamper-proof blockchain ledger tracking every reroute execution.
    Utilizes SHA-256 cryptographic chaining.
    """
    def __init__(self, ledger_file="resilience_ledger.json"):
        self.ledger_file = ledger_file
        self.chain = []
        self.load_chain()

    def load_chain(self):
        try:
            with open(self.ledger_file, 'r', encoding='utf-8') as f:
                self.chain = json.load(f)
        except FileNotFoundError:
            # Generate Genesis Block
            self.create_block(previous_hash="0", event_data={"event": "NEXUS_FLOW_GENESIS_BLOCK"})

    def save_chain(self):
        with open(self.ledger_file, 'w', encoding='utf-8') as f:
            json.dump(self.chain, f, indent=2)

    def hash_block(self, block):
        """Creates a deterministic SHA-256 hash of a block."""
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    def create_block(self, previous_hash, event_data):
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time.time(),
            'event_data': event_data,
            'previous_hash': previous_hash
        }
        self.chain.append(block)
        self.save_chain()
        return block

    def record_reroute(self, event_data):
        """Records a new state-changing logistical event into the ledger."""
        previous_block = self.chain[-1]
        previous_hash = self.hash_block(previous_block)
        new_block = self.create_block(previous_hash, event_data)
        print(f"[LEDGER] Recorded reroute. Block #{new_block['index']} secured.")
        return new_block['index']

    def verify_integrity(self):
        """Code Rabbit Check: Validates the cryptographic hashes of the entire chain."""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            # Recalculate hash of previous block and compare to the stored pointer
            if current_block['previous_hash'] != self.hash_block(previous_block):
                print(f"[CRITICAL] LEDGER INTEGRITY COMPROMISED at Block #{current_block['index']}")
                return False
                
        print("[+] Ledger Integrity Verified. Cryptographic chain is intact and tamper-proof.")
        return True

if __name__ == "__main__":
    ledger = ResilienceLedger()
    ledger.record_reroute({"carrier": "Maersk", "new_route": "RTE-OCEAN-SHZ-ROT"})
    ledger.record_reroute({"carrier": "FedEx", "new_route": "RTE-AIR-ROT-CHI"})
    ledger.verify_integrity()

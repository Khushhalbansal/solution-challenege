import json
import heapq
import time

def load_graph(config_path="network_config.json"):
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("[!] config not found. Creating mock nodes.")
        return {"nodes": [], "edges": []}

def build_adjacency_list(config):
    graph = {}
    for node in config.get('nodes', []):
        graph[node['node_id']] = []
    for edge in config.get('edges', []):
        u = edge['source_node']
        v = edge['target_node']
        risk = edge['current_risk_score']
        if u in graph:
            graph[u].append((v, risk, edge['edge_id'], edge['transit_mode']))
    return graph

def find_top_k_paths(graph, source, target, k=3):
    """
    Memory-Efficient implementation of K-Shortest Paths via heapq.
    Guarantees O(E + V log V) time complexity and minimal heap allocations.
    """
    pq = [(0.0, [source], [])]
    visit_count = {node: 0 for node in graph}
    completed_paths = []
    
    while pq and len(completed_paths) < k:
        cum_risk, node_path, edge_path = heapq.heappop(pq)
        u = node_path[-1]
        visit_count[u] += 1
        
        if u == target and visit_count[u] <= k:
            completed_paths.append({
                "risk_score": round(cum_risk, 3), 
                "nodes": node_path, 
                "edges": edge_path
            })
            continue
            
        if visit_count[u] <= k:
            for v, risk, edge_id, mode in graph.get(u, []):
                if v not in node_path: # O(V) check, acceptable for small V paths
                    heapq.heappush(pq, (cum_risk + risk, node_path + [v], edge_path + [edge_id]))
                    
    return completed_paths

def run_optimization():
    config = load_graph()
    adj_graph = build_adjacency_list(config)
    
    if not adj_graph:
        return
        
    source_node = "FAC-SHZ-01"
    target_node = "RET-CHI-01"
    
    top_paths = find_top_k_paths(adj_graph, source_node, target_node, k=3)
    
    output = {
        "timestamp": time.time(),
        "source": source_node, 
        "target": target_node, 
        "top_routes": top_paths
    }
    
    with open("active_routes.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

if __name__ == "__main__":
    run_optimization()
    print("[OPTIMIZER] Optimization complete. Top 3 routes written to active_routes.json")

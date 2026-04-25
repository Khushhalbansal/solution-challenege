import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Lucide-style SVG icons (inline, no import needed in artifact) ──
const Icon = ({ d, size = 16, color = "currentColor", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

// ── Color Palette ──
const C = {
  bg: '#030712',
  panel: 'rgba(15,23,42,0.85)',
  border: 'rgba(56,189,248,0.15)',
  borderBright: 'rgba(56,189,248,0.4)',
  cyan: '#38bdf8',
  cyanDim: 'rgba(56,189,248,0.15)',
  green: '#34d399',
  greenDim: 'rgba(52,211,153,0.12)',
  red: '#f87171',
  redDim: 'rgba(248,113,113,0.12)',
  amber: '#fbbf24',
  amberDim: 'rgba(251,191,36,0.12)',
  purple: '#a78bfa',
  purpleDim: 'rgba(167,139,250,0.12)',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textDim: '#475569',
};

// ── Network Graph Data ──
const NODES = {
  'FAC-SHZ': { id: 'FAC-SHZ', label: 'Shenzhen', sub: 'China Factory', x: 120, y: 200, type: 'factory', risk: 0.85 },
  'FAC-MTY': { id: 'FAC-MTY', label: 'Monterrey', sub: 'Mexico Factory', x: 200, y: 340, type: 'factory', risk: 0.20 },
  'DST-LAX': { id: 'DST-LAX', label: 'Los Angeles', sub: 'US Port', x: 430, y: 230, type: 'port', risk: 0.92 },
  'DST-ROT': { id: 'DST-ROT', label: 'Rotterdam', sub: 'EU Hub', x: 390, y: 110, type: 'port', risk: 0.65 },
  'RET-CHI': { id: 'RET-CHI', label: 'Chicago', sub: 'Retailer', x: 600, y: 200, type: 'retailer', risk: 0.15 },
};

const EDGES = [
  { id: 'e1', from: 'FAC-SHZ', to: 'DST-LAX', mode: 'Ocean', risk: 0.88, days: 24.5, active: true, main: true },
  { id: 'e2', from: 'FAC-SHZ', to: 'DST-LAX', mode: 'Air', risk: 0.15, days: 1.5, active: false, main: false },
  { id: 'e3', from: 'FAC-MTY', to: 'DST-LAX', mode: 'Rail', risk: 0.25, days: 3.2, active: false, main: false },
  { id: 'e4', from: 'FAC-SHZ', to: 'DST-ROT', mode: 'Ocean', risk: 0.95, days: 38, active: false, main: false },
  { id: 'e5', from: 'DST-LAX', to: 'RET-CHI', mode: 'Truck', risk: 0.35, days: 4.5, active: true, main: true },
  { id: 'e6', from: 'DST-LAX', to: 'RET-CHI', mode: 'Rail', risk: 0.10, days: 6.0, active: false, main: false },
  { id: 'e7', from: 'DST-ROT', to: 'RET-CHI', mode: 'Air', risk: 0.10, days: 0.8, active: false, main: false },
];

const MODE_COLORS = { Ocean: '#38bdf8', Air: '#a78bfa', Rail: '#34d399', Truck: '#fbbf24' };
const NODE_COLORS = { factory: '#38bdf8', port: '#fbbf24', retailer: '#34d399' };

// ── Dijkstra K-Shortest Paths ──
function findKShortestPaths(nodes, edges, source, target, k = 3, disabledNodes = new Set()) {
  const graph = {};
  Object.keys(nodes).forEach(id => { graph[id] = []; });
  edges.forEach(e => {
    if (!disabledNodes.has(e.from) && !disabledNodes.has(e.to)) {
      if (!graph[e.from]) graph[e.from] = [];
      graph[e.from].push({ to: e.to, risk: e.risk, edge: e });
    }
  });

  const results = [];
  // Priority queue as sorted array: [cumRisk, path, edgesUsed]
  const pq = [[0, [source], []]];
  const visitCount = {};

  while (pq.length && results.length < k) {
    pq.sort((a, b) => a[0] - b[0]);
    const [cumRisk, path, edgesUsed] = pq.shift();
    const u = path[path.length - 1];
    visitCount[u] = (visitCount[u] || 0) + 1;

    if (u === target) {
      results.push({ risk: cumRisk, path, edges: edgesUsed });
      continue;
    }
    if (visitCount[u] > k) continue;

    (graph[u] || []).forEach(({ to, risk, edge }) => {
      if (!path.includes(to)) {
        pq.push([cumRisk + risk, [...path, to], [...edgesUsed, edge]]);
      }
    });
  }
  return results;
}

// ── Animated path component (CSS keyframes trick) ──
function AnimatedEdge({ x1, y1, x2, y2, color, animated, width = 2 }) {
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={width}
      strokeDasharray={animated ? "8 4" : "none"}
      strokeOpacity={animated ? 1 : 0.25}
      style={animated ? {
        animation: 'dash 1.5s linear infinite',
        filter: `drop-shadow(0 0 4px ${color})`
      } : {}}
    />
  );
}

// ── Main Component ──
export default function Dashboard() {
  const [nodeStatus, setNodeStatus] = useState({}); // nodeId -> 'offline' | undefined
  const [activeEdges, setActiveEdges] = useState(new Set(['e1', 'e5']));
  const [routes, setRoutes] = useState([]);
  const [logs, setLogs] = useState([
    { id: 1, type: 'sys', text: 'NEXUS-FLOW OS v2.0 ONLINE. All systems nominal.' },
    { id: 2, type: 'math', text: 'Dijkstra heuristic ready. Graph: 5 nodes, 7 edges.' },
    { id: 3, type: 'sys', text: 'mTLS tunnels established. Blockchain ledger: 3 blocks.' },
  ]);
  const [ledger, setLedger] = useState([
    { index: 1, event: 'GENESIS_BLOCK', hash: '000000', carrier: '—', route: 'INIT' },
  ]);
  const [financials, setFinancials] = useState({ fleet: 450000, delay: 0, carbon: 1250, saved: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [driftData, setDriftData] = useState([
    { path: 'SHZ→LAX', predicted: 5.0, actual: 5.2, drift: 4.0 },
    { path: 'LAX→CHI', predicted: 4.5, actual: 4.6, drift: 2.2 },
  ]);
  const [systemStatus, setSystemStatus] = useState('NOMINAL');
  const logEndRef = useRef(null);
  const logId = useRef(100);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Live polling simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const paths = [
        { path: 'SHZ→LAX', predicted: 24.5, actual: 24.5 + (Math.random() - 0.4) * 4 },
        { path: 'LAX→CHI', predicted: 4.5, actual: 4.5 + (Math.random() - 0.3) * 1.5 },
        { path: 'MTY→LAX', predicted: 3.2, actual: 3.2 + (Math.random() - 0.4) * 1 },
      ];
      setDriftData(paths.map(p => ({
        ...p,
        actual: +p.actual.toFixed(2),
        drift: +(Math.abs((p.actual - p.predicted) / p.predicted) * 100).toFixed(1)
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const addLog = useCallback((type, text) => {
    setLogs(prev => [...prev.slice(-49), { id: ++logId.current, type, text }]);
  }, []);

  const addLedgerEntry = useCallback((carrier, route) => {
    setLedger(prev => {
      const newIndex = prev.length + 1;
      const fakeHash = Math.random().toString(16).slice(2, 18);
      return [...prev, { index: newIndex, event: 'REROUTE', hash: fakeHash, carrier, route }];
    });
  }, []);

  const recalcRoutes = useCallback((offlineNodes) => {
    const disabled = new Set(offlineNodes);
    const paths = findKShortestPaths(NODES, EDGES, 'FAC-SHZ', 'RET-CHI', 3, disabled);
    setRoutes(paths);

    if (paths.length > 0) {
      const best = paths[0];
      const newActive = new Set(best.edges.map(e => e.id));
      // Also add all other normal edges that aren't disrupted
      EDGES.forEach(e => {
        if (!disabled.has(e.from) && !disabled.has(e.to) && e.main) {
          newActive.add(e.id);
        }
      });
      setActiveEdges(newActive);

      const carrier = best.edges[0]?.mode === 'Air' ? 'FedEx' : best.edges[0]?.mode === 'Rail' ? 'Union Pacific' : 'Maersk';
      const routeStr = best.path.join('→');
      addLedgerEntry(carrier, routeStr);
      addLog('success', `[GSD] Optimal route: ${routeStr} | Risk: ${best.risk.toFixed(2)}`);
    }
  }, [addLog, addLedgerEntry]);

  const toggleNode = useCallback((nodeId) => {
    if (nodeId === 'FAC-SHZ' || nodeId === 'RET-CHI') return; // protect endpoints

    setNodeStatus(prev => {
      const isOffline = prev[nodeId] === 'offline';
      const newStatus = { ...prev };

      if (isOffline) {
        delete newStatus[nodeId];
        addLog('sys', `[i] Node ${nodeId} restored. Re-optimizing graph...`);
        setSystemStatus('NOMINAL');
        setFinancials({ fleet: 450000, delay: 0, carbon: 1250, saved: 0 });
        const offlineNodes = Object.keys(newStatus).filter(k => newStatus[k] === 'offline');
        if (offlineNodes.length === 0) {
          setActiveEdges(new Set(['e1', 'e5']));
          setRoutes([]);
        } else {
          recalcRoutes(offlineNodes);
        }
      } else {
        newStatus[nodeId] = 'offline';
        setSystemStatus('ALERT');
        addLog('error', `[!] BLACK SWAN: Node ${nodeId} OFFLINE. Port access lost.`);
        addLog('sys', `[@Gemini] Running 1,000+ Monte Carlo simulations...`);

        setTimeout(() => {
          addLog('math', `[MATH] Dijkstra penalty +9999 applied to ${nodeId}. Recalculating O(E+V logV)...`);
          const offlineNodes = Object.keys(newStatus).filter(k => newStatus[k] === 'offline');
          recalcRoutes(offlineNodes);

          const newFinancials = nodeId === 'DST-LAX'
            ? { fleet: 1250000, delay: 850000, carbon: 4500, saved: 2650000 }
            : { fleet: 850000, delay: 250000, carbon: 900, saved: 3250000 };
          setFinancials(newFinancials);
        }, 1200);
      }

      return newStatus;
    });
    setSelectedNode(nodeId);
  }, [addLog, recalcRoutes]);

  const offlineNodes = Object.keys(nodeStatus).filter(k => nodeStatus[k] === 'offline');

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, color: C.textPrimary,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&display=swap');
        @keyframes dash { to { stroke-dashoffset: -24; } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.6)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(56,189,248,0.3);border-radius:2px}
        .node-btn:hover { filter: drop-shadow(0 0 12px currentColor); cursor: pointer; }
        .edge-label { pointer-events: none; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        padding: '12px 24px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(3,7,18,0.9)', backdropFilter: 'blur(12px)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            fontSize: 20, fontWeight: 700, letterSpacing: '0.05em',
            background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>⚡ NEXUS-FLOW AI</div>
          <span style={{ fontSize: 10, color: C.textDim, letterSpacing: '0.2em' }}>
            GLOBAL STATE-SPACE OPTIMIZER v2.0
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <StatusBadge color={systemStatus === 'NOMINAL' ? C.green : C.red} label={`SYSTEM: ${systemStatus}`} />
          <StatusBadge color={C.cyan} label={`LEDGER: ${ledger.length} BLOCKS`} />
          <StatusBadge color={C.purple} label="mTLS: ACTIVE" />
        </div>
      </header>

      {/* ── Main Grid ── */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '260px 1fr 280px',
        gridTemplateRows: '1fr 180px',
        gap: 1, padding: 1, overflow: 'hidden',
        background: C.border
      }}>
        {/* LEFT: Control Panel */}
        <div style={{ gridRow: '1/3', background: C.bg, overflowY: 'auto' }}>
          <Panel title="🛡 CYBER DEFENSE" icon="🔒">
            <div style={{ fontSize: 10, color: C.textDim, marginBottom: 8 }}>ENCRYPTED TUNNELS</div>
            {['SHZ ↔ LAX (mTLS 1.3)', 'ROT ↔ CHI (AES-256)', 'API.ERP.SAP (JWT)'].map(t => (
              <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>
                <span style={{ color: C.textSecondary }}>{t}</span>
                <span style={{ color: C.green }}>🔒</span>
              </div>
            ))}

            <div style={{ marginTop: 16, fontSize: 10, color: C.textDim, marginBottom: 8 }}>LIVE AUDIT FEED</div>
            <div style={{ maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {logs.slice(-6).reverse().map(l => (
                <div key={l.id} style={{
                  fontSize: 10, padding: '3px 6px', borderRadius: 3, animation: 'slideIn 0.3s ease',
                  background: l.type === 'error' ? C.redDim : l.type === 'success' ? C.greenDim : 'rgba(255,255,255,0.03)',
                  color: l.type === 'error' ? C.red : l.type === 'success' ? C.green : l.type === 'math' ? C.cyan : C.textSecondary,
                  borderLeft: `2px solid ${l.type === 'error' ? C.red : l.type === 'success' ? C.green : l.type === 'math' ? C.cyan : C.textDim}`
                }}>
                  {l.text}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="📊 RALPH LOOP — DRIFT MONITOR">
            {driftData.map(d => (
              <div key={d.path} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
                  <span style={{ color: C.textSecondary }}>{d.path}</span>
                  <span style={{ color: d.drift > 15 ? C.red : d.drift > 8 ? C.amber : C.green }}>
                    {d.drift}% drift
                  </span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${Math.min(d.drift * 4, 100)}%`,
                    background: d.drift > 15 ? C.red : d.drift > 8 ? C.amber : C.green,
                    transition: 'width 0.8s ease, background 0.4s'
                  }} />
                </div>
                <div style={{ fontSize: 9, color: C.textDim, marginTop: 2 }}>
                  Pred: {d.predicted}d → Actual: {d.actual}d
                </div>
              </div>
            ))}
            {driftData.some(d => d.drift > 15) && (
              <div style={{ fontSize: 10, color: C.red, padding: '6px 8px', background: C.redDim, borderRadius: 4, marginTop: 4, animation: 'blink 1s infinite' }}>
                ⚠ LOGIC DRIFT DETECTED — Triggering Re-optimization
              </div>
            )}
          </Panel>

          <Panel title="📜 BLOCKCHAIN LEDGER">
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[...ledger].reverse().map(b => (
                <div key={b.index} style={{
                  fontSize: 10, padding: '5px 7px', background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${C.border}`, borderRadius: 4, animation: 'fadeIn 0.4s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: C.cyan }}>#{b.index} {b.event}</span>
                    <span style={{ color: C.textDim }}>SHA256</span>
                  </div>
                  <div style={{ color: C.textDim, marginTop: 2 }}>{b.carrier} → {b.route}</div>
                  <div style={{ color: C.textDim, fontSize: 9, fontFamily: 'monospace' }}>0x{b.hash}...</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* CENTER: Interactive Map */}
        <div style={{ background: C.bg, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, color: C.textDim, letterSpacing: '0.15em', zIndex: 10 }}>
            CLICK PORT/HUB NODES TO SIMULATE DISRUPTION
          </div>

          {/* Background grid */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56,189,248,0.04)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <NetworkMap
            nodes={NODES} edges={EDGES}
            nodeStatus={nodeStatus} activeEdges={activeEdges}
            onNodeClick={toggleNode} selectedNode={selectedNode}
          />

          {/* Route Legend */}
          <div style={{
            position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 12,
            background: 'rgba(3,7,18,0.85)', padding: '6px 12px', borderRadius: 6,
            border: `1px solid ${C.border}`, fontSize: 10
          }}>
            {Object.entries(MODE_COLORS).map(([mode, color]) => (
              <span key={mode} style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.textSecondary }}>
                <span style={{ width: 16, height: 2, background: color, display: 'inline-block', borderRadius: 1 }} />
                {mode}
              </span>
            ))}
          </div>

          {/* Node Info Popup */}
          {selectedNode && NODES[selectedNode] && (
            <NodeInfoPanel
              node={NODES[selectedNode]}
              status={nodeStatus[selectedNode]}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>

        {/* RIGHT: Financial Impact */}
        <div style={{ gridRow: '1/3', background: C.bg, overflowY: 'auto' }}>
          <Panel title="💰 IMPACT CALCULATOR">
            <MetricCard label="FLEET COST" value={`$${financials.fleet.toLocaleString()}`} color={C.cyan} sub="Dist × BaseRate ($0.08/mi Ocean)" />
            <MetricCard label="ESTIMATED DELAY LOSS" value={`$${financials.delay.toLocaleString()}`} color={C.red} sub="$250k/day in stockout" />
            <MetricCard label="AI MONEY SAVED" value={`$${financials.saved.toLocaleString()}`} color={C.green} sub="Stockout averted by reroute" highlight />
            <MetricCard label="CARBON FOOTPRINT" value={`${financials.carbon.toLocaleString()} MT CO₂`} color={C.amber} sub="Ocean 10g/t·km | Air 500g/t·km" />
          </Panel>

          <Panel title="🗺 TOP ROUTES (DIJKSTRA)">
            {routes.length === 0 ? (
              <div style={{ color: C.textDim, fontSize: 11, textAlign: 'center', padding: '20px 0' }}>
                No disruption active.<br />Click a node to simulate.
              </div>
            ) : routes.map((r, i) => (
              <div key={i} style={{
                marginBottom: 10, padding: 8,
                background: i === 0 ? C.greenDim : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i === 0 ? C.green : C.border}`,
                borderRadius: 6, animation: 'fadeIn 0.5s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: i === 0 ? C.green : C.textSecondary }}>
                    {i === 0 ? '★ OPTIMAL' : `ROUTE ${i + 1}`}
                  </span>
                  <span style={{ fontSize: 10, color: i === 0 ? C.green : C.textDim }}>
                    Risk: {r.risk.toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: C.textSecondary, lineHeight: 1.6 }}>
                  {r.path.map((p, j) => (
                    <span key={p}>
                      <span style={{ color: i === 0 ? C.cyan : C.textSecondary }}>{p.replace('FAC-', '').replace('DST-', '').replace('RET-', '')}</span>
                      {j < r.path.length - 1 && <span style={{ color: C.textDim }}> → </span>}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>
                  {r.edges.map(e => e.mode).join(' + ')}
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="🌐 NODE STATUS">
            {Object.values(NODES).map(node => (
              <div key={node.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '5px 0', borderBottom: `1px solid ${C.border}`, fontSize: 11
              }}>
                <div>
                  <div style={{ color: C.textPrimary }}>{node.id}</div>
                  <div style={{ fontSize: 9, color: C.textDim }}>{node.sub}</div>
                </div>
                <div style={{
                  padding: '2px 8px', borderRadius: 10, fontSize: 9,
                  background: nodeStatus[node.id] === 'offline' ? C.redDim : C.greenDim,
                  color: nodeStatus[node.id] === 'offline' ? C.red : C.green,
                  border: `1px solid ${nodeStatus[node.id] === 'offline' ? C.red : C.green}`,
                }}>
                  {nodeStatus[node.id] === 'offline' ? 'OFFLINE' : 'ONLINE'}
                </div>
              </div>
            ))}
          </Panel>
        </div>

        {/* BOTTOM: Terminal */}
        <div style={{ gridColumn: '2/3', background: '#000', borderTop: `1px solid ${C.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '6px 12px', borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0
          }}>
            <span style={{ color: C.cyan, fontSize: 11 }}>⬛ NEXUS_CORE // OPTIMIZER.PY</span>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: C.green,
              animation: 'pulse 1.5s infinite', display: 'inline-block'
            }} />
            <span style={{ fontSize: 10, color: C.green }}>LIVE</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {logs.map(log => (
              <div key={log.id} style={{
                fontSize: 10, fontFamily: 'monospace', animation: 'slideIn 0.3s ease',
                color: log.type === 'error' ? C.red : log.type === 'success' ? C.green
                  : log.type === 'math' ? C.cyan : log.type === 'warn' ? C.amber : C.textSecondary
              }}>
                <span style={{ color: C.textDim, userSelect: 'none' }}>nexus@core:~# </span>
                {log.text}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Network Map ──
function NetworkMap({ nodes, edges, nodeStatus, activeEdges, onNodeClick, selectedNode }) {
  const W = 780, H = 420;
  const scale = (x, y) => [x * W / 780, y * H / 420];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
      {/* Edges */}
      {edges.map(e => {
        const fn = nodes[e.from], tn = nodes[e.to];
        if (!fn || !tn) return null;
        const isActive = activeEdges.has(e.id);
        const color = isActive ? MODE_COLORS[e.mode] : 'rgba(100,116,139,0.25)';
        const [x1, y1] = scale(fn.x, fn.y);
        const [x2, y2] = scale(tn.x, tn.y);
        const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;

        return (
          <g key={e.id}>
            <AnimatedEdge x1={x1} y1={y1} x2={x2} y2={y2} color={color} animated={isActive} width={isActive ? 2.5 : 1} />
            {isActive && (
              <text x={midX} y={midY - 6} textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace" className="edge-label">
                {e.mode} ({e.days}d)
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {Object.values(nodes).map(n => {
        const [nx, ny] = scale(n.x, n.y);
        const isOffline = nodeStatus[n.id] === 'offline';
        const isSelected = selectedNode === n.id;
        const isEndpoint = n.id === 'FAC-SHZ' || n.id === 'RET-CHI';
        const color = isOffline ? '#f87171' : NODE_COLORS[n.type];

        return (
          <g key={n.id} onClick={() => !isEndpoint && onNodeClick(n.id)} className="node-btn" style={{ cursor: isEndpoint ? 'default' : 'pointer' }}>
            {/* Pulse ring for offline */}
            {isOffline && (
              <circle cx={nx} cy={ny} r="20" fill="none" stroke={C.red} strokeWidth="1.5"
                style={{ animation: 'pulse 1s infinite', opacity: 0.4 }} />
            )}
            {/* Selection ring */}
            {isSelected && !isOffline && (
              <circle cx={nx} cy={ny} r="16" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
            )}
            {/* Glow */}
            <circle cx={nx} cy={ny} r="12" fill={color} opacity="0.12" />
            {/* Main circle */}
            <circle cx={nx} cy={ny} r="8" fill={isOffline ? C.red : color}
              style={{ filter: `drop-shadow(0 0 6px ${isOffline ? C.red : color})` }} />
            {/* Inner dot */}
            <circle cx={nx} cy={ny} r="3" fill={C.bg} />

            {/* Label */}
            <text x={nx} y={ny + 22} textAnchor="middle" fill={C.textSecondary} fontSize="10" fontFamily="monospace" fontWeight="600">
              {n.id.split('-')[1]}
            </text>
            <text x={nx} y={ny + 34} textAnchor="middle" fill={C.textDim} fontSize="9" fontFamily="monospace">
              {n.sub}
            </text>

            {/* Risk badge */}
            <text x={nx + 10} y={ny - 8} textAnchor="start" fill={n.risk > 0.7 ? C.red : n.risk > 0.4 ? C.amber : C.green} fontSize="8">
              {(n.risk * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Node Info Panel ──
function NodeInfoPanel({ node, status, onClose }) {
  const isOffline = status === 'offline';
  return (
    <div style={{
      position: 'absolute', top: 40, right: 12, width: 200,
      background: 'rgba(3,7,18,0.95)', border: `1px solid ${isOffline ? C.red : C.border}`,
      borderRadius: 8, padding: 12, animation: 'fadeIn 0.2s ease', zIndex: 20
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: isOffline ? C.red : C.cyan, fontWeight: 700 }}>{node.id}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', fontSize: 14 }}>✕</button>
      </div>
      <div style={{ fontSize: 10, color: C.textSecondary, lineHeight: 1.8 }}>
        <div><span style={{ color: C.textDim }}>Location: </span>{node.sub}</div>
        <div><span style={{ color: C.textDim }}>Type: </span>{node.type}</div>
        <div><span style={{ color: C.textDim }}>Base Risk: </span>
          <span style={{ color: node.risk > 0.7 ? C.red : node.risk > 0.4 ? C.amber : C.green }}>
            {(node.risk * 100).toFixed(0)}%
          </span>
        </div>
        <div><span style={{ color: C.textDim }}>Status: </span>
          <span style={{ color: isOffline ? C.red : C.green }}>{isOffline ? '🔴 OFFLINE' : '🟢 ONLINE'}</span>
        </div>
      </div>
      {node.id !== 'FAC-SHZ' && node.id !== 'RET-CHI' && (
        <div style={{ marginTop: 8, fontSize: 9, color: C.textDim }}>Click node on map to toggle status</div>
      )}
    </div>
  );
}

// ── Reusable Components ──
function Panel({ title, children }) {
  return (
    <div style={{ padding: 12, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 10, color: C.textDim, letterSpacing: '0.12em', marginBottom: 10, fontWeight: 600 }}>{title}</div>
      {children}
    </div>
  );
}

function StatusBadge({ color, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px',
      borderRadius: 20, border: `1px solid ${color}30`, background: `${color}12`
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, animation: 'pulse 2s infinite' }} />
      <span style={{ fontSize: 9, color, letterSpacing: '0.1em', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function MetricCard({ label, value, color, sub, highlight }) {
  return (
    <div style={{
      marginBottom: 10, padding: 10,
      background: highlight ? `${color}10` : 'rgba(255,255,255,0.02)',
      border: `1px solid ${highlight ? color + '40' : C.border}`,
      borderRadius: 6, position: 'relative'
    }}>
      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: '0.12em', marginBottom: 4 }}>{label}</div>
      <div style={{
        fontSize: highlight ? 20 : 16, fontWeight: 700, color,
        fontFamily: 'monospace', transition: 'color 0.3s'
      }}>{value}</div>
      <div style={{ fontSize: 9, color: C.textDim, marginTop: 3 }}>{sub}</div>
    </div>
  );
}
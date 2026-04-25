import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity, ShieldCheck, DollarSign, Leaf, Terminal, Zap, Lock, RefreshCw, XCircle, ShieldAlert } from 'lucide-react';

const INITIAL_NODES = [
  { id: 'SHZ', name: 'Shenzhen', cx: 150, cy: 200, status: 'nominal' },
  { id: 'MTY', name: 'Monterrey', cx: 250, cy: 280, status: 'nominal' },
  { id: 'LAX', name: 'Los Angeles', cx: 500, cy: 220, status: 'nominal' },
  { id: 'ROT', name: 'Rotterdam', cx: 400, cy: 150, status: 'nominal' },
  { id: 'CHI', name: 'Chicago', cx: 650, cy: 180, status: 'target' },
];

export default function Dashboard() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [activeRoute, setActiveRoute] = useState('NORMAL'); // NORMAL, ROT_DETOUR, MTY_RAIL
  
  // Terminal Logs
  const [terminalLogs, setTerminalLogs] = useState([
    { id: 1, text: "NEXUS-FLOW OS v1.0 ONLINE. SECURE MTLS TUNNELS ESTABLISHED.", type: "sys" },
    { id: 2, text: "O(E + V log V) ROUTING HEURISTICS: STANDBY.", type: "math" }
  ]);
  const logEndRef = useRef(null);

  // Financial State
  const [financials, setFinancials] = useState({
    fleetCost: 450000,
    delayLoss: 0,
    carbon: 1250,
    moneySaved: 0
  });

  // Cyber Logs
  const [cyberLogs, setCyberLogs] = useState([
    { id: 1, msg: "mTLS Handshake: SHZ <-> LAX verified.", status: "ok" }
  ]);

  const addLog = (text, type = "sys") => {
    setTerminalLogs(prev => [...prev, { id: Date.now() + Math.random(), text, type }]);
  };

  const addCyberLog = (msg, status = "ok") => {
    setCyberLogs(prev => [{ id: Date.now() + Math.random(), msg, status }, ...prev].slice(0, 5));
  };

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const toggleNodeShutdown = (nodeId) => {
    if (nodeId === 'SHZ' || nodeId === 'CHI') return; // Protect source/target for demo

    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const isShuttingDown = n.status === 'nominal';
        
        if (isShuttingDown) {
          addLog(`[!] BLACK SWAN EVENT: Node ${nodeId} offline. Connectivity lost.`, "error");
          addCyberLog(`DETECTED MALICIOUS PACKET @ ${nodeId}. TCP RST Sent.`, "alert");
          
          setTimeout(() => {
            addCyberLog(`Rotating mTLS Keys...`, "warn");
            addLog(`[GEMINI PRO] Recalculating state-space...`, "sys");
          }, 800);

          setTimeout(() => {
            addCyberLog(`Integrity Verified. Threat Isolated.`, "ok");
            addLog(`[MATH] heapq.heappop() -> executing Dijkstra penalty +9999 to ${nodeId}`, "math");
            addLog(`[MATH] Target edge isolated. Re-weighting: O(E + V log V) in 0.02ms`, "math");
          }, 1500);

          // Reroute Logic Simulation
          setTimeout(() => {
            if (nodeId === 'LAX') {
              setActiveRoute('ROT_DETOUR');
              setFinancials({ fleetCost: 1250000, delayLoss: 850000, carbon: 4500, moneySaved: 2650000 });
              addLog(`[GSD] Reroute Executed: SHZ -> ROT -> CHI (Air Freight)`, "success");
            } else if (nodeId === 'ROT') {
              setActiveRoute('MTY_RAIL');
              setFinancials({ fleetCost: 850000, delayLoss: 250000, carbon: 900, moneySaved: 3250000 });
              addLog(`[GSD] Reroute Executed: MTY -> LAX -> CHI (Rail)`, "success");
            }
          }, 2500);
        } else {
          addLog(`[i] Node ${nodeId} restored. Normalizing graph...`, "sys");
          setActiveRoute('NORMAL');
          setFinancials({ fleetCost: 450000, delayLoss: 0, carbon: 1250, moneySaved: 0 });
        }
        return { ...n, status: isShuttingDown ? 'shutdown' : 'nominal' };
      }
      return n;
    }));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 font-sans selection:bg-indigo-500/30">
      <header className="flex justify-between items-center mb-6 px-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
            <Zap className="text-cyan-400" /> NEXUS-FLOW AI
          </h1>
          <p className="text-slate-500 text-xs font-mono mt-1 tracking-[0.2em]">GLOBAL STATE-SPACE OPTIMIZER</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-full">
            <Activity size={14} /> SYSTEM: NOMINAL
          </span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-100px)]">
        
        {/* LEFT COL: Cyber Defense */}
        <div className="col-span-3 space-y-4 flex flex-col">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex-1 backdrop-blur-md">
            <h2 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2 mb-4">
              <ShieldCheck className="text-indigo-400" size={16}/> Cyber Defense Monitor
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-black/40 border border-slate-800 rounded-lg text-xs font-mono space-y-2">
                <div className="text-slate-500 mb-1 border-b border-slate-800 pb-1">LIVE AUDIT LOGS</div>
                <AnimatePresence>
                  {cyberLogs.map(log => (
                    <motion.div 
                      key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-2 ${
                        log.status === 'ok' ? 'text-emerald-500' : 
                        log.status === 'warn' ? 'text-amber-500' : 'text-red-500'
                      }`}
                    >
                      <span>{'>'}</span>
                      <span className="break-words leading-tight">{log.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg text-xs space-y-2">
                <div className="text-indigo-400 font-bold mb-2">ENCRYPTED TUNNELS</div>
                <div className="flex justify-between items-center text-slate-400"><span>SHZ-LAX</span><Lock size={12}/></div>
                <div className="flex justify-between items-center text-slate-400"><span>ROT-CHI</span><Lock size={12}/></div>
                <div className="flex justify-between items-center text-slate-400"><span>API.ERP.SAP</span><Lock size={12}/></div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COL: Interactive Map & Logic Terminal */}
        <div className="col-span-6 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl flex-1 relative overflow-hidden group">
            <div className="absolute top-4 left-4 z-10 text-xs font-mono text-slate-500">
              CLICK ANY NODE TO SIMULATE SHUTDOWN
            </div>
            
            {/* SVG Map */}
            <svg viewBox="0 0 800 400" className="w-full h-full absolute inset-0">
              
              {/* NORMAL ROUTES */}
              <motion.path 
                d="M 150 200 Q 325 250 500 220" fill="none" 
                stroke={activeRoute === 'NORMAL' ? "#3b82f6" : "#1e293b"} strokeWidth="2" strokeDasharray="4 4"
              />
              <motion.path 
                d="M 500 220 Q 575 200 650 180" fill="none" 
                stroke={activeRoute === 'NORMAL' ? "#3b82f6" : "#1e293b"} strokeWidth="2" strokeDasharray="4 4"
              />

              {/* REROUTE: ROTTERDAM */}
              {activeRoute === 'ROT_DETOUR' && (
                <>
                  <motion.path d="M 150 200 Q 275 100 400 150" fill="none" stroke="#10b981" strokeWidth="4" opacity="0.4" />
                  <motion.path d="M 150 200 Q 275 100 400 150" fill="none" stroke="#10b981" strokeWidth="2" initial={{pathLength:0}} animate={{pathLength:1}} />
                  
                  <motion.path d="M 400 150 Q 525 100 650 180" fill="none" stroke="#10b981" strokeWidth="4" opacity="0.4" />
                  <motion.path d="M 400 150 Q 525 100 650 180" fill="none" stroke="#10b981" strokeWidth="2" initial={{pathLength:0}} animate={{pathLength:1}} transition={{delay: 0.5}} />
                </>
              )}

              {/* REROUTE: MONTERREY */}
              {activeRoute === 'MTY_RAIL' && (
                <>
                  <motion.path d="M 250 280 Q 375 250 500 220" fill="none" stroke="#10b981" strokeWidth="4" opacity="0.4" />
                  <motion.path d="M 250 280 Q 375 250 500 220" fill="none" stroke="#10b981" strokeWidth="2" initial={{pathLength:0}} animate={{pathLength:1}} />
                </>
              )}

              {/* NODES */}
              {nodes.map(n => (
                <g key={n.id} onClick={() => toggleNodeShutdown(n.id)} className="cursor-pointer">
                  {n.status === 'shutdown' && (
                    <motion.circle cx={n.cx} cy={n.cy} r="16" fill="#ef4444" opacity="0.2" animate={{scale:[1, 1.5, 1]}} transition={{repeat:Infinity, duration:1}} />
                  )}
                  <circle cx={n.cx} cy={n.cy} r="8" fill={n.status === 'shutdown' ? '#ef4444' : n.status === 'target' ? '#10b981' : '#3b82f6'} className="transition-colors duration-300"/>
                  <text x={n.cx - 10} y={n.cy + 20} fill="#94a3b8" fontSize="10" className="font-mono">{n.id}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Logic Terminal */}
          <div className="bg-black/80 border border-slate-800 rounded-xl h-48 p-4 font-mono text-xs overflow-y-auto shadow-inner flex flex-col">
            <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800 pb-2 sticky top-0 bg-black/80">
              <Terminal size={14}/> <span>NEXUS_CORE // OPTIMIZER.PY EXECUTION LOG</span>
            </div>
            <div className="space-y-1 flex-1">
              {terminalLogs.map(log => (
                <div key={log.id} className={`${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'math' ? 'text-cyan-400' :
                  log.type === 'warn' ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  <span className="opacity-50 select-none mr-2">root@nexus:~#</span>
                  {log.text}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* RIGHT COL: Financial Impact */}
        <div className="col-span-3 space-y-4 flex flex-col">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex-1 backdrop-blur-md">
            <h2 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2 mb-4">
              <DollarSign className="text-emerald-400" size={16}/> Impact Calculator
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 font-mono mb-1">CURRENT FLEET COST</div>
                <div className="text-2xl font-mono text-slate-200">${financials.fleetCost.toLocaleString()}</div>
                <div className="text-[10px] text-slate-600 mt-1">Formula: Dist * BaseRate ($0.08/mi Ocean)</div>
              </div>

              <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg">
                <div className="text-xs text-red-500/70 font-mono mb-1">ESTIMATED DELAY LOSS</div>
                <div className="text-2xl font-mono text-red-400">${financials.delayLoss.toLocaleString()}</div>
                <div className="text-[10px] text-red-900/50 mt-1">Formula: $250k / day in Stockout</div>
              </div>

              <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><DollarSign size={40}/></div>
                <div className="text-xs text-emerald-500/70 font-mono mb-1">AI MONEY SAVED</div>
                <div className="text-3xl font-black font-mono text-emerald-400">${financials.moneySaved.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-900/50 mt-1">Total Stockout Loss - Reroute Premium</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 font-mono mb-1 flex items-center gap-1">
                  <Leaf size={12}/> CARBON FOOTPRINT
                </div>
                <div className="text-lg font-mono text-amber-100">{financials.carbon.toLocaleString()} MT</div>
                <div className="text-[10px] text-slate-600 mt-1">Ocean: 10g/t-km | Air: 500g/t-km</div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

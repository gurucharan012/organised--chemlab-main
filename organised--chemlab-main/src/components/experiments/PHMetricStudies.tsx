"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Beaker, Activity, TrendingUp, RotateCcw, ArrowLeft, Info, FlaskConical, Play, ChevronRight, Droplet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface DataPoint {
  v_step: number; // Volume added in this step (1.0 mL)
  v_total: number; // Cumulative volume
  ph: number;
  dph?: number; // ΔpH
  dv?: number; // ΔV
  dphdv?: number; // ΔpH/ΔV
  remark?: string;
}

interface PHMetricStudiesProps {
  onBack: () => void;
}

const LabSimulation = ({ volume, ph, isStirring }: { volume: number; ph: number; isStirring: boolean }) => {
  return (
    <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden h-[400px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)] pointer-events-none" />
      
      <div className="relative h-full flex items-end justify-center gap-12">
        {/* pH Meter Display */}
        <div className="absolute top-0 right-0 p-4 bg-zinc-900/80 border border-white/10 rounded-2xl backdrop-blur-md z-20">
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase font-black text-blue-400 tracking-widest mb-1">pH MONITOR</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-mono font-bold text-white tabular-nums">{ph.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Burette Setup */}
        <div className="relative w-16 h-full flex flex-col items-center">
          <div className="absolute top-0 w-2 h-48 bg-white/10 border border-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="absolute bottom-0 w-full bg-blue-400/30"
              initial={{ height: "100%" }}
              animate={{ height: `${Math.max(0, 100 - (volume / 25) * 100)}%` }}
            />
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="absolute w-full h-[1px] bg-white/20" style={{ top: `${i * 10}%` }} />
            ))}
          </div>
          <div className="absolute top-48 w-4 h-4 bg-zinc-700 border border-white/20 rounded-sm" />
          <div className="absolute top-52 w-1 h-8 bg-white/10" />
          
          {isStirring && volume > 0 && (
            <motion.div 
              className="absolute top-[220px] w-1 h-1 bg-blue-400 rounded-full"
              animate={{ 
                y: [0, 60],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 0.6,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
        </div>

        {/* Titration Beaker & Electrode */}
        <div className="relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-4 z-10">
            {/* pH Combination Electrode */}
            <div className="w-3 h-28 bg-blue-500/40 border border-blue-400/50 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] flex flex-col items-center">
              <div className="w-full h-1/4 bg-blue-600/60 rounded-t-full" />
              <div className="w-0.5 h-1/2 bg-blue-300/40 mt-1" />
              <div className="w-2 h-2 bg-blue-200/60 rounded-full mt-auto mb-1" />
            </div>
          </div>

          <div className="relative w-40 h-48 border-2 border-white/20 border-t-0 rounded-b-[2rem] bg-white/5 backdrop-blur-sm overflow-hidden">
            <motion.div 
              className="absolute bottom-0 w-full"
              style={{
                backgroundColor: ph < 7 ? "rgba(239, 68, 68, 0.15)" : ph > 7 ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.15)"
              }}
              animate={{ 
                height: `${40 + (volume / 25) * 40}%`,
              }}
            />
            
            <motion.div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-2 bg-white/80 rounded-full shadow-lg"
              animate={{ 
                rotate: isStirring ? 360 : 0,
                scaleX: isStirring ? [1, 0.8, 1] : 1
              }}
              transition={{ 
                duration: isStirring ? 0.2 : 0,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          <div className="mt-2 w-48 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center gap-8 shadow-xl">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${isStirring ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-zinc-800"}`} />
              </div>
              <span className="text-[6px] uppercase font-black text-zinc-600 mt-1">Power</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function PHMetricStudies({ onBack }: PHMetricStudiesProps) {
  const [v_hcl] = useState(10); // Volume of HCl used
  const [m_naoh] = useState(0.1); // Molarity of NaOH
  const [v_water] = useState(90); // Deionized water added
  const [hidden_m_hcl] = useState(() => 0.05 + Math.random() * 0.02); // Target endpoint around 5.0-7.0 mL
  
  const calculatePH = (v_added: number) => {
    const total_v_initial = v_hcl + v_water;
    const moles_hcl = (v_hcl * hidden_m_hcl) / 1000;
    const moles_naoh = (v_added * m_naoh) / 1000;
    const total_v_current = (total_v_initial + v_added) / 1000;

    let ph = 7;
    if (moles_hcl > moles_naoh) {
      const h_conc = (moles_hcl - moles_naoh) / total_v_current;
      ph = -Math.log10(h_conc);
    } else if (moles_naoh > moles_hcl) {
      const oh_conc = (moles_naoh - moles_hcl) / total_v_current;
      const p_oh = -Math.log10(oh_conc);
      ph = 14 - p_oh;
    } else {
      ph = 7;
    }
    
    // Add some noise
    return ph + (Math.random() * 0.04 - 0.02);
  };

  const [data, setData] = useState<DataPoint[]>(() => [
    { v_step: 0, v_total: 0, ph: calculatePH(0), remark: "pH increases (pH < 7)" }
  ]);
  const [step, setStep] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);

  const addPoint = () => {
    if (currentVolume >= 15) return;
    
    const nextVolume = currentVolume + 1;
    const nextPH = calculatePH(nextVolume);
    const prevPoint = data[data.length - 1];
    
    const dph = nextPH - prevPoint.ph;
    const dv = 1;
    const dphdv = dph / dv;
    
    let remark = "";
    if (nextPH < 6.5) remark = "pH increases (pH < 7)";
    else if (nextPH >= 6.5 && nextPH <= 7.5) remark = "End point, pH around 7";
    else remark = "pH increases (pH > 7)";

    setData(prev => [
      ...prev,
      { v_step: 1, v_total: nextVolume, ph: nextPH, dph, dv, dphdv, remark }
    ]);
    setCurrentVolume(nextVolume);
  };

  const autoTitrate = async () => {
    setIsSimulating(true);
    let vol = currentVolume;
    while (vol < 15) {
      await new Promise(r => setTimeout(r, 400));
      vol += 1;
      const nextPH = calculatePH(vol);
      setData(prev => {
        const last = prev[prev.length - 1];
        const dph = nextPH - last.ph;
        let rem = "";
        if (nextPH < 6.5) rem = "pH increases (pH < 7)";
        else if (nextPH >= 6.5 && nextPH <= 7.5) rem = "End point, pH around 7";
        else rem = "pH increases (pH > 7)";
        
        return [...prev, { 
          v_step: 1, 
          v_total: vol, 
          ph: nextPH, 
          dph, 
          dv: 1, 
          dphdv: dph,
          remark: rem
        }];
      });
      setCurrentVolume(vol);
    }
    setIsSimulating(false);
  };

  const resetExperiment = () => {
    setData([{ v_step: 0, v_total: 0, ph: calculatePH(0), remark: "pH increases (pH < 7)" }]);
    setCurrentVolume(0);
    setStep(1);
    setIsSimulating(false);
  };

  const endPoint = useMemo(() => {
    if (data.length < 3) return null;
    const maxDeriv = Math.max(...data.filter(d => d.dphdv !== undefined).map(d => d.dphdv!));
    const point = data.find(d => d.dphdv === maxDeriv);
    return point ? point.v_total : null;
  }, [data]);

  const results = useMemo(() => {
    if (!endPoint) return null;
    const m1 = (m_naoh * endPoint) / v_hcl;
    const amount = m1 * 36.45;
    return { m1, amount };
  }, [endPoint, m_naoh, v_hcl]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-6 md:p-12 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-6">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Back</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-white font-bold tracking-tight">ChemLab v4.0</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">pH-Metric Analysis System</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${data.length > 1 ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-zinc-700"}`} />
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Live Feedback</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <header className="relative py-4">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "circOut" }} className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] text-center md:text-left">
              pH-METRIC<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">STUDIES</span>
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
              <p className="text-zinc-500 max-w-lg text-sm md:text-base leading-relaxed text-center md:text-left">
                Determine the molarity of HCl acid using standard NaOH solution. Observe how pH changes during neutralization and locate the stoichiometric point.
              </p>
            </div>
          </motion.div>
        </header>

        {step === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-blue-500" />
                  Experimental Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase font-black text-zinc-500 mb-1">HCl Sample</p>
                    <p className="text-white font-bold">{v_hcl} mL</p>
                    <p className="text-xs text-zinc-500">~{hidden_m_hcl.toFixed(3)} M</p>
                  </div>
                  <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase font-black text-zinc-500 mb-1">NaOH Titrant</p>
                    <p className="text-white font-bold">{m_naoh} M</p>
                    <p className="text-xs text-zinc-500">Standard Solution</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-4">
                  <Droplet className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-bold text-white">Dilution Protocol</p>
                    <p className="text-xs text-zinc-500">10 mL HCl mixed with 90 mL deionized water in a 250 mL beaker.</p>
                  </div>
                </div>

                <Button 
                  onClick={() => setStep(2)}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  INITIALIZE SYSTEM
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>

            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-zinc-900/40 to-transparent border border-white/5 space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 underline decoration-blue-500 underline-offset-8">PRINCIPLE</h4>
                <p className="text-sm text-zinc-400 leading-relaxed italic">
                  "The pH of a solution is related to H+ ion concentration as pH = -log[H+]. Adding NaOH decreases H+ ions until the equivalence point, where pH shifts sharply from acidic to alkaline range."
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">METHODOLOGY</h4>
                {[
                  "Transfer 10 mL HCl to a 250 mL beaker.",
                  "Add 90 mL deionized water and mix.",
                  "Calibrate pH electrode and place in solution.",
                  "Add NaOH in 1.0 mL increments from burette.",
                  "Record pH after each addition until 15 mL total.",
                  "Calculate endpoint from first derivative plot."
                ].map((s, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">0{i+1}</span>
                    <p className="text-xs text-zinc-400">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Control & Table */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="p-8 bg-blue-500/10 border-b border-white/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-1">Active Reading</p>
                      <p className="text-5xl font-mono font-bold text-white tabular-nums">
                        {data[data.length - 1].ph.toFixed(2)}
                      </p>
                    </div>
                    <Activity className={`w-10 h-10 text-blue-500 ${isSimulating ? "animate-pulse" : ""}`} />
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <Button 
                      onClick={addPoint}
                      disabled={currentVolume >= 15 || isSimulating}
                      className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      ADD 1.0 mL NaOH
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline"
                        onClick={autoTitrate}
                        disabled={currentVolume >= 15 || isSimulating}
                        className="h-12 border-white/5 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-xl"
                      >
                        <Play className="w-4 h-4 mr-2" /> AUTO-TITRATE
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={resetExperiment}
                        className="h-12 border-white/5 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-xl"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" /> RESET
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <span className="text-[10px] uppercase font-black text-zinc-500">Volume Added</span>
                    <span className="text-xl font-mono font-bold text-blue-400">{currentVolume.toFixed(1)} mL</span>
                  </div>
                </div>
              </Card>

              <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 overflow-hidden shadow-xl">
                <div className="p-4 bg-black/20 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Observation Table</h3>
                  <div className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-[10px] font-mono text-zinc-500">
                    S.No 1 - {data.length}
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5 bg-zinc-900/30">
                        <TableHead className="text-[9px] uppercase font-black text-zinc-600">V (mL)</TableHead>
                        <TableHead className="text-[9px] uppercase font-black text-zinc-600">pH</TableHead>
                        <TableHead className="text-[9px] uppercase font-black text-zinc-600">ΔpH/ΔV</TableHead>
                        <TableHead className="text-[9px] uppercase font-black text-zinc-600">Remark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((point, i) => (
                        <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="font-mono text-[10px]">{point.v_total.toFixed(1)}</TableCell>
                          <TableCell className="font-mono text-[10px] text-white font-bold">{point.ph.toFixed(2)}</TableCell>
                          <TableCell className="font-mono text-[10px] text-blue-400">
                            {point.dphdv !== undefined ? point.dphdv.toFixed(3) : "—"}
                          </TableCell>
                          <TableCell className="text-[9px] text-zinc-500 italic max-w-[100px] truncate">
                            {point.remark}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Simulation & Analysis */}
            <div className="lg:col-span-8 space-y-8">
              <LabSimulation 
                volume={currentVolume} 
                ph={data[data.length - 1].ph} 
                isStirring={isSimulating || currentVolume > 0} 
              />
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] p-6 shadow-xl">
                  <div className="mb-6 flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">pH Curve</h3>
                      <p className="text-[10px] text-zinc-600">pH vs Volume NaOH</p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                        <XAxis dataKey="v_total" hide />
                        <YAxis stroke="#52525b" fontSize={10} domain={[0, 14]} ticks={[0, 2, 4, 6, 8, 10, 12, 14]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ph" 
                          stroke="#3b82f6" 
                          strokeWidth={3} 
                          dot={{ r: 3, fill: '#3b82f6' }} 
                          activeDot={{ r: 6, fill: '#60a5fa' }}
                          animationDuration={500}
                        />
                        {endPoint && <ReferenceLine x={endPoint} stroke="#4ade80" strokeDasharray="5 5" />}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] p-6 shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Derivative Curve</h3>
                    <p className="text-[10px] text-zinc-600">ΔpH/ΔV vs Volume</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.filter(d => d.dphdv !== undefined)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                        <XAxis dataKey="v_total" hide />
                        <YAxis stroke="#52525b" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="dphdv" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          dot={{ r: 3, fill: '#10b981' }} 
                          animationDuration={500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Results */}
              {currentVolume >= 15 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Analytical Result</h3>
                          <p className="text-blue-100 text-xs opacity-70">Endpoint (V₂) determined at {endPoint?.toFixed(1)} mL</p>
                        </div>
                        <Activity className="w-8 h-8 text-white/30" />
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest mb-1">Molarity of HCl (M₁)</p>
                          <p className="text-5xl font-mono font-black text-white">
                            {results?.m1.toFixed(4)} <span className="text-sm font-sans opacity-60">M</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest mb-1">Concentration (g/L)</p>
                          <p className="text-4xl font-mono font-black text-white">
                            {results?.amount.toFixed(3)} <span className="text-sm font-sans opacity-60">g/L</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10 flex flex-col gap-2">
                        <p className="text-[10px] text-blue-100 uppercase font-black tracking-widest">Calculations</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[11px] font-mono text-blue-50">
                          <span>M₁ = (V₂ × M₂) / V₁ = ({endPoint} × 0.1) / 10</span>
                          <span>Amount = M₁ × 36.45 g/L</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-4">
                    <Card className="bg-[#0a0a0a] border-white/5 rounded-3xl p-6 shadow-xl">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Verification</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-xs text-zinc-500">Endpoint</span>
                          <span className="text-sm font-bold text-emerald-400">{endPoint?.toFixed(1)} mL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-zinc-500">Max ΔpH/ΔV</span>
                          <span className="text-sm font-bold text-blue-400">
                            {Math.max(...data.filter(d => d.dphdv !== undefined).map(d => d.dphdv!)).toFixed(3)}
                          </span>
                        </div>
                        <div className="pt-2 flex items-center gap-2 text-[10px] text-zinc-500 italic">
                          <Info className="w-3 h-3" />
                          Stoichiometric point reached.
                        </div>
                      </div>
                    </Card>
                    <Button 
                      onClick={onBack}
                      className="w-full h-14 bg-zinc-900 border border-white/5 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all"
                    >
                      FINALISE REPORT
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 bg-zinc-900/20 border border-white/5 border-dashed rounded-[2rem]">
                  <Activity className="w-12 h-12 text-zinc-800 mb-4" />
                  <p className="text-sm text-zinc-500 font-medium">Add titrant from burette to continue...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Beaker, Activity, TrendingUp, RotateCcw, Save, ArrowLeft, Info, FlaskConical, Play, Square, ChevronRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface DataPoint {
  v: number; // Volume of NaOH
  e: number; // Potential EMF
  de?: number; // ΔE
  dedv?: number; // ΔE/ΔV
}

interface PotentiometryHClProps {
  onBack: () => void;
}

const LabSimulation = ({ volume, emf, isStirring }: { volume: number; emf: number; isStirring: boolean }) => {
  return (
    <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden h-[400px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
      
      <div className="relative h-full flex items-end justify-center gap-12">
        {/* Potentiometer Display */}
        <div className="absolute top-0 right-0 p-4 bg-zinc-900/80 border border-white/10 rounded-2xl backdrop-blur-md z-20">
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase font-black text-indigo-400 tracking-widest mb-1">EMF MONITOR</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-mono font-bold text-white tabular-nums">{emf}</span>
              <span className="text-xs text-zinc-500 font-bold">mV</span>
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
            {/* Graduations */}
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="absolute w-full h-[1px] bg-white/20" style={{ top: `${i * 10}%` }} />
            ))}
          </div>
          <div className="absolute top-48 w-4 h-4 bg-zinc-700 border border-white/20 rounded-sm" />
          <div className="absolute top-52 w-1 h-8 bg-white/10" />
          
          {/* Dripping Animation */}
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

        {/* Titration Beaker & Electrodes */}
        <div className="relative">
          {/* Electrodes */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-4 z-10">
            {/* Glass Electrode */}
            <div className="w-2 h-24 bg-indigo-500/40 border border-indigo-400/50 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
            {/* Calomel Electrode */}
            <div className="w-2 h-24 bg-zinc-500/40 border border-zinc-400/50 rounded-full shadow-[0_0_10px_rgba(161,161,170,0.2)]" />
          </div>

          {/* 250mL Beaker */}
          <div className="relative w-40 h-48 border-2 border-white/20 border-t-0 rounded-b-[2rem] bg-white/5 backdrop-blur-sm overflow-hidden">
            <motion.div 
              className="absolute bottom-0 w-full bg-blue-500/20"
              animate={{ 
                height: `${40 + (volume / 25) * 40}%`,
              }}
            />
            
            {/* Stirring Bar */}
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

            {/* Bubbles if stirring */}
            {isStirring && Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-6 w-1 h-1 bg-white/40 rounded-full"
                animate={{
                  y: [-10, -80],
                  x: [0, (Math.random() - 0.5) * 40],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                style={{ left: `${20 + Math.random() * 60}%` }}
              />
            ))}
          </div>

          {/* Magnetic Stirrer Base */}
          <div className="mt-2 w-48 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center gap-8 shadow-xl">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${isStirring ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-zinc-800"}`} />
              </div>
              <span className="text-[6px] uppercase font-black text-zinc-600 mt-1">Power</span>
            </div>
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-500"
                animate={{ width: isStirring ? "80%" : "0%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function PotentiometryHCl({ onBack }: PotentiometryHClProps) {
  const [v1] = useState(10); // Volume of HCl
  const [m2] = useState(0.1); // Molarity of NaOH
  const [hiddenM1] = useState(() => 0.08 + Math.random() * 0.04);
  const [data, setData] = useState<DataPoint[]>([
    { v: 0, e: 0 } // Placeholder for initial calculation
  ]);
  const [step, setStep] = useState(1); // 1: Setup, 2: Titration, 3: Results
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);

  // Calculate EMF based on volume added
  const calculateEMF = (vTitrant: number) => {
    const v1Val = v1;
    const m2Val = m2;
    const m1Val = hiddenM1;
    
    const molesAcid = (m1Val * v1Val) / 1000;
    const molesBase = (m2Val * vTitrant) / 1000;
    const totalV = (v1Val + vTitrant + 90) / 1000; // +90ml water as per procedure

    let ph = 7;
    if (molesAcid > molesBase) {
      const hConc = (molesAcid - molesBase) / totalV;
      ph = Math.max(1.0, -Math.log10(hConc));
    } else if (molesBase > molesAcid) {
      const ohConc = (molesBase - molesAcid) / totalV;
      const pOh = -Math.log10(ohConc);
      ph = Math.min(14.0, 14.0 - pOh);
    } else {
      ph = 7;
    }

    // Model EMF: E = E0 + 59.1 * pH
    // Let's shift it to look like typical potentiometry values (e.g. 200mV to 800mV)
    return Math.round(200 + 45 * ph + (Math.random() * 2 - 1));
  };

  // Initialize first point
  useMemo(() => {
    if (data.length === 1 && data[0].v === 0 && data[0].e === 0) {
      setData([{ v: 0, e: calculateEMF(0) }]);
    }
  }, []);

  const addPoint = () => {
    if (currentVolume >= 20) return;
    
    const nextVolume = currentVolume + 1;
    const nextEMF = calculateEMF(nextVolume);
    
    const prevPoint = data[data.length - 1];
    const de = nextEMF - prevPoint.e;
    const dv = 1;
    const dedv = de / dv;

    setData(prev => [
      ...prev,
      { v: nextVolume, e: nextEMF, de, dedv }
    ]);
    setCurrentVolume(nextVolume);
  };

  const autoTitrate = async () => {
    setIsSimulating(true);
    let vol = currentVolume;
    while (vol < 20) {
      await new Promise(r => setTimeout(r, 200));
      vol += 1;
      const nextEMF = calculateEMF(vol);
      setData(prev => {
        const last = prev[prev.length - 1];
        const de = nextEMF - last.e;
        return [...prev, { v: vol, e: nextEMF, de, dedv: de }];
      });
      setCurrentVolume(vol);
    }
    setIsSimulating(false);
  };

  const resetExperiment = () => {
    setData([{ v: 0, e: calculateEMF(0) }]);
    setCurrentVolume(0);
    setStep(1);
    setIsSimulating(false);
  };

  const endPoint = useMemo(() => {
    if (data.length < 3) return null;
    const maxDeriv = Math.max(...data.filter(d => d.dedv !== undefined).map(d => d.dedv!));
    const point = data.find(d => d.dedv === maxDeriv);
    // Refine: The end point is usually between the point before and the point with max deriv
    // But for 1ml increments, we can take the volume at max ΔE/ΔV as an approximation
    // Or interpolate. Let's stick to the peak for simplicity in this model.
    return point ? point.v : null;
  }, [data]);

  const results = useMemo(() => {
    if (!endPoint) return null;
    const m1Calc = (m2 * endPoint) / v1;
    const amountGpl = m1Calc * 36.45;
    return { m1: m1Calc, amount: amountGpl };
  }, [endPoint, v1, m2]);

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
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20">
                <Activity className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-white font-bold tracking-tight">ChemLab v4.0</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Potentiometric Analysis System</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${data.length > 1 ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-zinc-700"}`} />
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Signal Active</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <header className="relative py-4">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "circOut" }} className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] text-center md:text-left">
              POTENTIO<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-400">METRY</span>
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
              <p className="text-zinc-500 max-w-lg text-sm md:text-base leading-relaxed text-center md:text-left">
                Determining HCl molarity through potential difference measurements. Observe the sharp inflection point in the EMF curve to identify the equivalence point.
              </p>
            </div>
          </motion.div>
        </header>

        {step === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-indigo-500" />
                  Apparatus & Reagents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase font-black text-zinc-500 mb-1">Analyte</p>
                    <p className="text-white font-bold">10 mL HCl</p>
                    <p className="text-xs text-zinc-500">+ 90 mL DI Water</p>
                  </div>
                  <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase font-black text-zinc-500 mb-1">Titrant</p>
                    <p className="text-white font-bold">0.1 M NaOH</p>
                    <p className="text-xs text-zinc-500">Standard Solution</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Electrodes</h4>
                  <div className="flex items-center gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                    <Activity className="w-6 h-6 text-indigo-500" />
                    <div>
                      <p className="text-sm font-bold text-white">Glass Electrode + Calomel</p>
                      <p className="text-xs text-zinc-500">Combined Indicator & Reference</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setStep(2)}
                  className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl transition-all"
                >
                  START TITRATION
                </Button>
              </CardContent>
            </Card>

            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-zinc-900/40 to-transparent border border-white/5 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 underline decoration-indigo-500 underline-offset-4">PRINCIPLE</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Potentiometric titration involves measuring the potential difference between an indicator electrode and a reference electrode as the titrant is added. The equivalence point is marked by a sudden, sharp change in EMF, corresponding to the maximum value of the first derivative (ΔE/ΔV).
              </p>
              <div className="pt-6 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">PROCEDURE</h4>
                {[
                  "Take 10 mL of HCl in a 250 mL beaker.",
                  "Add 90 mL of deionized water and mix well.",
                  "Immerse electrodes and record initial EMF.",
                  "Add NaOH in 1.0 mL increments from burette.",
                  "Measure and record EMF after each addition.",
                  "Plot E vs V and ΔE/ΔV vs V to find endpoint."
                ].map((s, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">0{i+1}</span>
                    <p className="text-xs text-zinc-400">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left: Titration Control & Table */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="p-8 bg-indigo-500/10 border-b border-white/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest mb-1">Current Potential</p>
                      <p className="text-4xl font-mono font-bold text-white tabular-nums">
                        {data[data.length - 1].e} <span className="text-sm font-sans text-zinc-600">mV</span>
                      </p>
                    </div>
                    <Activity className={`w-8 h-8 text-indigo-500 ${isSimulating ? "animate-pulse" : ""}`} />
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <Button 
                      onClick={addPoint}
                      disabled={currentVolume >= 20 || isSimulating}
                      className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <ChevronRight className="w-5 h-5" />
                      ADD 1.0 mL NaOH
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline"
                        onClick={autoTitrate}
                        disabled={currentVolume >= 20 || isSimulating}
                        className="h-12 border-white/5 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-xl"
                      >
                        <Play className="w-4 h-4 mr-2" /> AUTO
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
                    <span className="text-[10px] uppercase font-black text-zinc-500">Total Volume</span>
                    <span className="text-xl font-mono font-bold text-indigo-400">{currentVolume.toFixed(1)} mL</span>
                  </div>
                </div>
              </Card>

              <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 overflow-hidden">
                <div className="p-4 bg-black/20 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Data Logger</h3>
                  <div className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-[10px] font-mono text-zinc-500">
                    {data.length} pts
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5 bg-zinc-900/30">
                        <TableHead className="text-[9px] uppercase font-black text-zinc-600">V (mL)</TableHead>
                        <TableHead className="text-[9px] uppercase font-black text-zinc-600">E (mV)</TableHead>
                        <TableHead className="text-[9px] uppercase font-black text-zinc-600">ΔE/ΔV</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((point, i) => (
                        <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="font-mono text-xs">{point.v.toFixed(1)}</TableCell>
                          <TableCell className="font-mono text-xs text-white">{point.e}</TableCell>
                          <TableCell className="font-mono text-xs text-indigo-400 font-bold">
                            {point.dedv !== undefined ? point.dedv : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Right: Graphs & Results */}
            <div className="lg:col-span-8 space-y-8">
              <LabSimulation 
                volume={currentVolume} 
                emf={data[data.length - 1].e} 
                isStirring={isSimulating || currentVolume > 0} 
              />
              <div className="grid md:grid-cols-2 gap-8">
                {/* Potential Curve */}
                <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] p-6 shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">EMF vs Volume</h3>
                    <p className="text-[10px] text-zinc-600">Potentiometric Curve</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                        <XAxis dataKey="v" hide />
                        <YAxis stroke="#52525b" fontSize={10} domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          labelStyle={{ color: '#6366f1' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="e" 
                          stroke="#6366f1" 
                          strokeWidth={3} 
                          dot={{ r: 3, fill: '#6366f1' }} 
                          activeDot={{ r: 6, fill: '#818cf8' }}
                          animationDuration={500}
                        />
                        {endPoint && <ReferenceLine x={endPoint} stroke="#4ade80" strokeDasharray="5 5" />}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Derivative Curve */}
                <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] p-6 shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">ΔE/ΔV vs Volume</h3>
                    <p className="text-[10px] text-zinc-600">First Derivative Curve</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.filter(d => d.dedv !== undefined)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                        <XAxis dataKey="v" hide />
                        <YAxis stroke="#52525b" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="dedv" 
                          stroke="#4ade80" 
                          strokeWidth={3} 
                          dot={{ r: 3, fill: '#4ade80' }} 
                          animationDuration={500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Results Panel */}
              {currentVolume >= 15 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                    <motion.div 
                      className="absolute inset-0 bg-white/10" 
                      animate={{ x: ["-100%", "200%"] }} 
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }} 
                    />
                    <div className="relative z-10 space-y-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Experimental Result</h3>
                          <p className="text-indigo-200 text-xs">Calculations finalized based on endpoint V₂ = {endPoint} mL</p>
                        </div>
                        <Activity className="w-8 h-8 text-white/30" />
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mb-1">Molarity of HCl (M₁)</p>
                          <p className="text-5xl font-mono font-black text-white">{results?.m1.toFixed(4)} <span className="text-sm font-sans opacity-60 italic">M</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mb-1">Amount Concentration</p>
                          <p className="text-4xl font-mono font-black text-white">{results?.amount.toFixed(3)} <span className="text-sm font-sans opacity-60">g/L</span></p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10 space-y-2">
                        <p className="text-[10px] text-indigo-100 uppercase font-black tracking-widest">Calculated Workflow</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-mono text-indigo-100">
                          <span>M1 = (V2 x M2) / V1 = ({endPoint} x 0.1) / 10</span>
                          <span>Amount = M1 x 36.45</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-4">
                    <Card className="bg-[#0a0a0a] border-white/5 rounded-3xl p-6 shadow-xl">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">ENDPOINT VERIFICATION</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500">Volume (V2)</span>
                          <span className="text-sm font-mono font-bold text-green-400">{endPoint} mL</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500">Peak ΔE/ΔV</span>
                          <span className="text-sm font-mono font-bold text-indigo-400">
                            {Math.max(...data.filter(d => d.dedv !== undefined).map(d => d.dedv!))}
                          </span>
                        </div>
                        <div className="pt-4 flex items-center gap-2 text-[10px] text-zinc-500 italic">
                          <Info className="w-3 h-3" />
                          Endpoint detected at maximum inflection.
                        </div>
                      </div>
                    </Card>
                    <Button 
                      onClick={onBack}
                      className="w-full h-14 bg-zinc-900 border border-white/5 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all"
                    >
                      CLOSE EXPERIMENT
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 bg-zinc-900/20 border border-white/5 border-dashed rounded-[2rem]">
                  <Activity className="w-12 h-12 text-zinc-800 mb-4" />
                  <p className="text-sm text-zinc-500 font-medium">Add more titrant to generate curve...</p>
                  <p className="text-[10px] text-zinc-700 mt-1 uppercase tracking-widest font-black">Requires minimum 15 mL for analysis</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full animate-pulse" />
      </div>
    </div>
  );
}

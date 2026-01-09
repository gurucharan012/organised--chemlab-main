"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { FlaskConical, Beaker, Pipette, Info, CheckCircle2, Play, Square, RotateCcw, Save, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Trial {
  id: number;
  initial: string;
  final: string;
  isSimulating?: boolean;
}

interface VolumetricStudyProps {
  onBack: () => void;
}

export default function VolumetricStudy({ onBack }: VolumetricStudyProps) {
  const [trials, setTrials] = useState<Trial[]>([
    { id: 1, initial: "0.00", final: "", isSimulating: false },
    { id: 2, initial: "0.00", final: "", isSimulating: false },
    { id: 3, initial: "0.00", final: "", isSimulating: false },
  ]);
  const [v1, setV1] = useState("25.0"); 
  const [m2, setM2] = useState("0.100"); 
  const [buretteCapacity, setBuretteCapacity] = useState("50.0");
  const [concordantValue, setConcordantValue] = useState<number | null>(null);
  const [m1, setM1] = useState<number | null>(null);
  const [amountHcl, setAmountHcl] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [activeTrialId, setActiveTrialId] = useState<number | null>(null);
  const [simulatedValue, setSimulatedValue] = useState(0);
  const [targetVolume, setTargetVolume] = useState(0);
  const [hiddenM1, setHiddenM1] = useState(0.1);
  const [isFlowing, setIsFlowing] = useState(false);
  const [flowSpeed, setFlowSpeed] = useState(0.2);

  const currentPh = useMemo(() => {
    const v1Val = parseFloat(v1) || 0;
    const m2Val = parseFloat(m2) || 0;
    const m1Val = hiddenM1;
    const vTitrant = simulatedValue;
    
    if (v1Val === 0) return "7.00";

    const molesAcid = (m1Val * v1Val) / 1000;
    const molesBase = (m2Val * vTitrant) / 1000;
    const totalV = (v1Val + vTitrant) / 1000;

    if (molesAcid > molesBase) {
      const hConc = (molesAcid - molesBase) / totalV;
      return Math.max(1.0, -Math.log10(hConc)).toFixed(2);
    } else if (molesBase > molesAcid) {
      const ohConc = (molesBase - molesAcid) / totalV;
      const pOh = -Math.log10(ohConc);
      return Math.min(14.0, 14.0 - pOh).toFixed(2);
    } else {
      return "7.00";
    }
  }, [v1, m2, simulatedValue, hiddenM1]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFlowing && activeTrialId !== null) {
      interval = setInterval(() => {
        setSimulatedValue(prev => {
          const capacity = parseFloat(buretteCapacity) || 50;
          if (prev >= capacity) {
            setIsFlowing(false);
            return prev;
          }
          return Math.min(capacity, prev + flowSpeed); 
        });
      }, 100); 
    }
    return () => clearInterval(interval);
  }, [isFlowing, activeTrialId, buretteCapacity, flowSpeed]);

  const startTitration = (id: number) => {
    const trial = trials.find(t => t.id === id);
    if (!trial) return;

    setActiveTrialId(id);
    setSimulatedValue(0);
    setIsFlowing(false);
    
    setTrials(prev => prev.map(t => t.id === id ? { ...t, final: "", isSimulating: true } : t));

    const v1Val = parseFloat(v1) || 10;
    const m2Val = parseFloat(m2) || 0.1;
    let target = (hiddenM1 * v1Val) / m2Val;
    target += (Math.random() * 0.4 - 0.2);
    
    const completedTrials = trials.filter(t => t.final && t.id !== id);
    if (completedTrials.length > 0) {
      const firstFinal = parseFloat(completedTrials[0].final);
      const firstInitial = parseFloat(completedTrials[0].initial);
      target = (firstFinal - firstInitial) + (Math.random() * 0.1 - 0.05);
    }
    setTargetVolume(target);
  };

  const recordReading = () => {
    if (activeTrialId === null) return;
    const trial = trials.find(t => t.id === activeTrialId);
    if (!trial) return;

    const finalReading = (parseFloat(trial.initial) + simulatedValue).toFixed(2);
    setTrials(prev => prev.map(t => 
      t.id === activeTrialId ? { ...t, final: finalReading, isSimulating: false } : t
    ));
    setActiveTrialId(null);
    setIsFlowing(false);
  };

  const proceedToObservation = () => {
    setHiddenM1(0.08 + Math.random() * 0.04);
    setTrials([
      { id: 1, initial: "0.00", final: "", isSimulating: false },
      { id: 2, initial: "0.00", final: "", isSimulating: false },
      { id: 3, initial: "0.00", final: "", isSimulating: false },
    ]);
    setStep(2);
  };

  const calculateResults = () => {
    const volumes = trials
      .map((t) => parseFloat(t.final) - parseFloat(t.initial))
      .filter((v) => !isNaN(v) && v > 0);

    if (volumes.length === 0) return;

    const counts: Record<string, number> = {};
    volumes.forEach((v) => {
      const key = v.toFixed(2);
      counts[key] = (counts[key] || 0) + 1;
    });
    const sortedByFreq = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const cv = parseFloat(sortedByFreq[0][0]);
    setConcordantValue(cv);

    const v1Val = parseFloat(v1);
    const m2Val = parseFloat(m2);
    if (v1Val > 0) {
      const calculatedM1 = (m2Val * cv) / v1Val;
      setM1(calculatedM1);
      setAmountHcl(calculatedM1 * 36.45);
      setStep(3);
    }
  };

  const resetExperiment = () => {
    setStep(1);
    setSimulatedValue(0);
    setActiveTrialId(null);
    setIsFlowing(false);
    setConcordantValue(null);
    setM1(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-6 md:p-12 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex justify-between items-center border-b border-white/5 pb-6">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] uppercase font-black tracking-widest">Home</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                <Beaker className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-white font-bold tracking-tight">ChemLab v4.0</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">High Precision Volumetric Analysis</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${step > 1 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-700"}`} />
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Apparatus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${step > 2 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-700"}`} />
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Analysis</span>
            </div>
          </div>
        </div>

        <header className="relative py-4">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "circOut" }} className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] text-center md:text-left">
              TITRATION<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">PROTOCOLS</span>
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
              <p className="text-zinc-500 max-w-lg text-sm md:text-base leading-relaxed text-center md:text-left">
                Determining the concentration of an unknown hydrochloric acid solution using a standardized sodium hydroxide solution and phenolphthalein indicator.
              </p>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 p-1 bg-zinc-800/20 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-3xl overflow-hidden">
          <div className="group bg-[#0a0a0a] p-8 space-y-3 transition-colors hover:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Pipette className="w-3.5 h-3.5 text-blue-500" />
              <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Acid Molarity (M₁)</Label>
            </div>
            <div className="text-3xl font-mono font-bold text-white group-hover:text-blue-400 transition-colors">{step === 3 ? m1?.toFixed(4) : "???"}</div>
          </div>
          <div className="group bg-[#0a0a0a] p-8 space-y-3 transition-colors hover:bg-zinc-900/50 border-l border-white/5">
            <div className="flex items-center gap-2">
              <Beaker className="w-3.5 h-3.5 text-green-500" />
              <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Base Molarity (M₂)</Label>
            </div>
            <Input value={m2} onChange={(e) => setM2(e.target.value)} className="bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-3xl font-mono font-bold text-green-500" />
          </div>
          <div className="group bg-[#0a0a0a] p-8 space-y-3 transition-colors hover:bg-zinc-900/50 border-l border-white/5">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-zinc-400" />
              <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Acid Volume (V₁)</Label>
            </div>
            <Input value={v1} onChange={(e) => setV1(e.target.value)} className="bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-3xl font-mono font-bold text-white" />
          </div>
          <div className="group bg-[#0a0a0a] p-8 space-y-3 transition-colors hover:bg-zinc-900/50 border-l border-white/5">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-zinc-400" />
              <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Capacity (ml)</Label>
            </div>
            <Input value={buretteCapacity} onChange={(e) => setBuretteCapacity(e.target.value)} className="bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-3xl font-mono font-bold text-white" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="setup" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center gap-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <div className="p-8 bg-zinc-900/30 border border-white/5 rounded-3xl space-y-4">
                  <h3 className="text-white font-bold text-lg">Reagents Preparation</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5"><span className="text-xs text-zinc-500">HCl Solution</span><span className="text-xs text-zinc-300 font-mono">{v1}ml Unknown Conc.</span></div>
                    <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5"><span className="text-xs text-zinc-500">NaOH Titrant</span><span className="text-xs text-zinc-300 font-mono">{m2}M Standardized</span></div>
                    <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5"><span className="text-xs text-zinc-500">Indicator</span><span className="text-xs text-zinc-300">Phenolphthalein</span></div>
                  </div>
                </div>
                <div className="p-8 bg-zinc-900/30 border border-white/5 rounded-3xl flex flex-col justify-center gap-6">
                  <p className="text-zinc-400 text-sm leading-relaxed italic font-serif">"Accuracy is the foundation of scientific discovery. Ensure your burette is rinsed and zeroed before beginning the titration process."</p>
                  <Button onClick={proceedToObservation} className="h-16 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-2xl transition-all shadow-[0_20px_40px_rgba(37,99,235,0.25)]">Enter Laboratory Deck</Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="lab" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-10">
                <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 p-12 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-8 left-8 space-y-6 z-20">
                    <div><p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Live pH Meter</p><motion.p key={currentPh} initial={{ opacity: 0.5, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl font-mono font-bold text-blue-500 tabular-nums">{currentPh}</motion.p></div>
                    <div><p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Titrant Flow</p><p className="text-3xl font-mono font-bold text-white tabular-nums">{simulatedValue.toFixed(1)} <span className="text-sm font-sans text-zinc-600">ml</span></p></div>
                  </div>
                  
                  <div className="relative h-[720px] flex">
                    <div className="flex-1 flex flex-col items-center justify-center pt-12">
                      {/* Burette Body */}
                      <div className="relative h-[350px] w-10 group">
                        <div className="relative h-full w-full bg-gradient-to-r from-zinc-800/20 via-white/5 to-zinc-800/20 border-x border-white/10 rounded-full overflow-hidden backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.02)]">
                          <div className="absolute inset-0 flex flex-col px-1.5 py-4 pointer-events-none">
                            {Array.from({ length: 21 }).map((_, i) => (
                              <div key={i} className="flex-1 flex items-center justify-between border-t border-white/5">
                                <span className="text-[5px] font-mono text-zinc-600 font-bold">{i * 2.5}</span>
                                <div className="w-1.5 h-[1px] bg-white/10" />
                              </div>
                            ))}
                          </div>
                          <motion.div 
                            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-500/30 via-blue-400/20 to-transparent border-t border-blue-400/40" 
                            initial={{ height: "100%" }} 
                            animate={{ height: `${Math.max(0, 100 - (simulatedValue / (parseFloat(buretteCapacity) || 50)) * 100)}%` }} 
                            transition={{ duration: 1, ease: "linear" }} 
                          />
                        </div>
                        
                        {/* Stopcock visualization */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                          <div className="w-1 h-6 bg-zinc-800/80" />
                          <motion.div 
                            className={`w-8 h-2 rounded-full shadow-xl z-20 cursor-pointer active:scale-95 transition-transform`}
                            onClick={() => activeTrialId !== null && setIsFlowing(!isFlowing)}
                            animate={{ 
                              rotate: isFlowing ? 90 : 0,
                              backgroundColor: isFlowing ? "#3b82f6" : "#3f3f46"
                            }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          />
                          <div className="w-1 h-4 bg-zinc-800/80" />
                        </div>

                        {/* Drop Animation */}
                        {isFlowing && (
                          <motion.div 
                            className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400/80 rounded-full blur-[1px]" 
                            animate={{ y: [0, 100], opacity: [0, 1, 0], scale: [1, 1.2, 0.5] }} 
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeIn" }} 
                          />
                        )}
                      </div>

                      {/* Spacing for Drop Flow */}
                      <div className="h-32" />

                      {/* Conical Flask */}
                      <div className="relative">
                        <div className="relative z-10 w-44 h-44">
                          <svg viewBox="0 0 100 100" className="w-full h-full fill-none drop-shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                            <path d="M35 10 L65 10 L65 25 L85 90 L15 90 L35 25 Z" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                            <defs><clipPath id="flask-mask"><path d="M35 10 L65 10 L65 25 L85 90 L15 90 L35 25 Z" /></clipPath></defs>
                            <motion.path d="M0 60 H100 V100 H0 Z" clipPath="url(#flask-mask)" animate={{ fill: simulatedValue >= targetVolume ? "#ff007f35" : "#3b82f615" }} transition={{ fill: { duration: 1.5 } }} />
                            <motion.circle cx="50" cy="75" r="25" className="blur-2xl" animate={{ fill: simulatedValue >= targetVolume ? "#ff007f40" : "transparent" }} transition={{ duration: 2 }} />
                          </svg>
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-3 bg-black rounded-full blur-md opacity-60" />
                      </div>
                    </div>

                    {/* Control Panel (Right Side) */}
                    <div className="w-56 flex flex-col justify-end gap-4 pb-12 z-30">
                      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 backdrop-blur-xl">
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] text-center">Protocol Controls</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[8px] uppercase font-black tracking-widest text-zinc-600">Flow Speed</span>
                            <span className="text-[8px] font-mono text-blue-500 font-bold">{flowSpeed.toFixed(2)} ml/s</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => setFlowSpeed(0.05)} 
                              className={`flex-1 h-8 text-[8px] rounded-lg border ${flowSpeed === 0.05 ? "bg-blue-600 border-blue-400 text-white" : "bg-zinc-900 border-white/5 text-zinc-500"}`}
                            >SLOW</Button>
                            <Button 
                              size="sm" 
                              onClick={() => setFlowSpeed(0.2)} 
                              className={`flex-1 h-8 text-[8px] rounded-lg border ${flowSpeed === 0.2 ? "bg-blue-600 border-blue-400 text-white" : "bg-zinc-900 border-white/5 text-zinc-500"}`}
                            >FAST</Button>
                          </div>
                        </div>

                        <Button 
                          onClick={() => setIsFlowing(!isFlowing)} 
                          disabled={activeTrialId === null} 
                          className={`w-full h-20 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-2 active:scale-95 ${
                            isFlowing 
                              ? "bg-red-500 text-white border border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)]" 
                              : "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_15px_30px_rgba(37,99,235,0.25)]"
                          }`}
                        >
                          {isFlowing ? (
                            <>
                              <Square className="w-5 h-5 fill-current" />
                              <span className="text-[10px] uppercase tracking-widest">Stop Titrant</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5 fill-current" />
                              <span className="text-[10px] uppercase tracking-widest">Start Titrant</span>
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={recordReading} 
                          disabled={activeTrialId === null || isFlowing} 
                          className="w-full h-16 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 border border-white/5 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
                        >
                          <Save className="w-4 h-4" />
                          <span className="text-[10px] uppercase tracking-widest">Record Final</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-lg">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <h3 className="text-sm font-bold tracking-tight text-white">Observation Deck</h3>
                    {activeTrialId && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Trial #{activeTrialId} Active</span>
                      </div>
                    )}
                  </div>
                  <Table>
                    <TableHeader><TableRow className="border-white/5 hover:bg-transparent"><TableHead className="text-zinc-500 text-[10px] uppercase font-black">Trial ID</TableHead><TableHead className="text-zinc-500 text-[10px] uppercase font-black">Initial (ml)</TableHead><TableHead className="text-zinc-500 text-[10px] uppercase font-black">Final (ml)</TableHead><TableHead className="text-zinc-500 text-[10px] uppercase font-black">Volume Used</TableHead><TableHead className="text-right text-zinc-500 text-[10px] uppercase font-black">Operations</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {trials.map((trial) => {
                        const used = parseFloat(trial.final) - parseFloat(trial.initial);
                        const isActive = activeTrialId === trial.id;
                        return (
                          <TableRow key={trial.id} className={`border-white/5 transition-colors ${isActive ? "bg-blue-500/5" : "hover:bg-white/5"}`}>
                            <TableCell className="font-black text-zinc-500">#{trial.id.toString().padStart(2, '0')}</TableCell>
                            <TableCell className="font-mono text-zinc-400">{trial.initial}</TableCell>
                            <TableCell className="font-mono">{trial.final ? <span className="text-zinc-100">{trial.final}</span> : isActive ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-500 font-bold">{simulatedValue.toFixed(2)}</motion.span> : <span className="text-zinc-800">—</span>}</TableCell>
                            <TableCell className="font-mono">{!isNaN(used) && used >= 0 ? <span className="text-green-500 font-bold">{used.toFixed(2)} ml</span> : <span className="text-zinc-800">—</span>}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => startTitration(trial.id)} 
                                disabled={activeTrialId !== null || trial.final !== ""} 
                                className={`h-8 px-4 text-[10px] font-black uppercase rounded-lg transition-all active:scale-95 ${trial.final ? "text-zinc-600 cursor-default" : "text-blue-500 hover:bg-blue-500/10 hover:text-blue-400 border border-transparent hover:border-blue-500/20"}`}
                              >
                                {trial.final ? "COMPLETED" : "LOAD TITRATION"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-8">
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-start"><div><h3 className="text-xl font-bold text-white tracking-tight">Final Analytics</h3><p className="text-xs text-zinc-500">Systematic calculation based on recorded values.</p></div><div className="p-2 rounded-xl bg-zinc-900 border border-white/5"><CheckCircle2 className="w-5 h-5 text-blue-500" /></div></div>
                    <div className="space-y-4">
                      <Button onClick={calculateResults} disabled={trials.some(t => !t.final) || step === 3} className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl transition-all active:scale-95">ANALYZE EXPERIMENTAL DATA</Button>
                      <Button variant="outline" onClick={resetExperiment} className="w-full h-14 border-white/5 bg-transparent text-zinc-500 hover:text-zinc-100 hover:bg-white/5 rounded-2xl transition-all active:scale-95"><RotateCcw className="mr-2 h-4 w-4" /> RESTART SIMULATION</Button>
                    </div>
                    <AnimatePresence>
                      {step === 3 && m1 && amountHcl && (
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="space-y-4 pt-4">
                          <div className="p-8 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 shadow-2xl border border-white/20 relative overflow-hidden">
                            <motion.div 
                              className="absolute inset-0 bg-white/10" 
                              animate={{ x: ["-100%", "200%"] }} 
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }} 
                            />
                            <div className="space-y-8 relative z-10">
                              <div><p className="text-[10px] text-blue-100 font-black uppercase tracking-widest">Calculated Molarity (M₁)</p><p className="text-6xl font-mono font-black text-white tracking-tighter">{m1.toFixed(4)}</p></div>
                              <div className="h-[1px] bg-white/10" />
                              <div><p className="text-[10px] text-blue-100 font-black uppercase tracking-widest">Mass Concentration</p><p className="text-4xl font-mono font-black text-white tracking-tighter">{amountHcl.toFixed(3)} <span className="text-sm font-sans opacity-60">g/L</span></p></div>
                            </div>
                          </div>
                          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 flex justify-between items-center"><span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Concordant Volume</span><span className="text-sm font-mono font-bold text-green-500">{concordantValue?.toFixed(2)} ml</span></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="p-8 rounded-[2rem] bg-gradient-to-b from-zinc-900/40 to-transparent border border-white/5 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">EXPERIMENTAL PROTOCOL</h4>
                  <ul className="space-y-4">
                    {["Select a trial row and click 'Load Titration'.", "Use 'Start Flow' to begin titrant release.", "Monitor for faint pink color (Endpoint).", "Stop flow and record final volume.", "Identify concordant values for final analysis."].map((s, i) => (<li key={i} className="flex gap-4 group cursor-help"><span className="text-[10px] font-black text-blue-500 group-hover:scale-125 transition-transform">0{i+1}.</span><p className="text-xs text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors">{s}</p></li>))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="fixed inset-0 pointer-events-none -z-10"><div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full animate-pulse" /><div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse" /></div>
    </div>
  );
}

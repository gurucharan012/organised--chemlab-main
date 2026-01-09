"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { FlaskConical, Beaker, Pipette, Info, CheckCircle2, Play, Square, RotateCcw, Save, ArrowLeft, Flame, Gauge, AlertCircle, Thermometer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Trial {
  id: number;
  initial: string;
  final: string;
  isSimulating?: boolean;
}

interface KMnO4TitrationProps {
  onBack: () => void;
}

export default function KMnO4Titration({ onBack }: KMnO4TitrationProps) {
  const [trials, setTrials] = useState<Trial[]>([
    { id: 1, initial: "0.00", final: "", isSimulating: false },
    { id: 2, initial: "0.00", final: "", isSimulating: false },
    { id: 3, initial: "0.00", final: "", isSimulating: false },
  ]);
  const [v1, setV1] = useState("10.0"); // Volume of Oxalic acid
  const [m1, setM1] = useState("0.100"); // Molarity of Oxalic acid
  const [buretteCapacity, setBuretteCapacity] = useState("50.0");
  const [concordantValue, setConcordantValue] = useState<number | null>(null);
  const [m2, setM2] = useState<number | null>(null); // Molarity of KMnO4
  const [strength, setStrength] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [activeTrialId, setActiveTrialId] = useState<number | null>(null);
  const [simulatedValue, setSimulatedValue] = useState(0);
  const [targetVolume, setTargetVolume] = useState(0);
  const [hiddenM2, setHiddenM2] = useState(0.02); // Typical KMnO4 molarity for this experiment
  const [isFlowing, setIsFlowing] = useState(false);
  const [isHeating, setIsHeating] = useState(false);
  const [temperature, setTemperature] = useState(25);
  const [flowSpeed, setFlowSpeed] = useState(0.2); // ml per interval
  const [showHeatWarning, setShowHeatWarning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHeating && temperature < 70) {
      interval = setInterval(() => {
        setTemperature(prev => Math.min(75, prev + 1.2));
      }, 100);
    } else if (!isHeating && temperature > 25) {
      interval = setInterval(() => {
        setTemperature(prev => Math.max(25, prev - 0.1));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isHeating, temperature]);

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
    if (temperature < 60) {
      setShowHeatWarning(true);
      setTimeout(() => setShowHeatWarning(false), 3000);
      return;
    }
    const trial = trials.find(t => t.id === id);
    if (!trial) return;

    setActiveTrialId(id);
    setSimulatedValue(0);
    setIsFlowing(false);
    
    setTrials(prev => prev.map(t => t.id === id ? { ...t, final: "", isSimulating: true } : t));

    const v1Val = parseFloat(v1) || 10;
    const m1Val = parseFloat(m1) || 0.1;
    // M1V1/n1 = M2V2/n2 => V2 = (M1V1 * n2) / (M2 * n1)
    // n1 = 5 (Oxalic acid), n2 = 2 (KMnO4)
    let target = (m1Val * v1Val * 2) / (hiddenM2 * 5);
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
    setHiddenM2(0.018 + Math.random() * 0.004);
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
    const m1Val = parseFloat(m1);
    if (cv > 0) {
      // M2 = (M1 * V1 * 2) / (V2 * 5)
      const calculatedM2 = (m1Val * v1Val * 2) / (cv * 5);
      setM2(calculatedM2);
      setStrength(calculatedM2 * 158.034);
      setStep(3);
    }
  };

  const resetExperiment = () => {
    setStep(1);
    setSimulatedValue(0);
    setActiveTrialId(null);
    setIsFlowing(false);
    setConcordantValue(null);
    setM2(null);
    setTemperature(25);
    setIsHeating(false);
  };

  const getFlaskFillColor = () => {
    // Before endpoint: colorless (slight blueish/whiteish tint)
    // At endpoint: pale pink
    // After endpoint: deeper pink
    if (simulatedValue < targetVolume - 0.1) return "rgba(255, 255, 255, 0.05)";
    if (simulatedValue < targetVolume) return "rgba(255, 182, 193, 0.2)"; // Very pale pink
    if (simulatedValue < targetVolume + 0.1) return "rgba(255, 105, 180, 0.4)"; // Pink
    return "rgba(199, 21, 133, 0.6)"; // Deep pink
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-6 md:p-12 font-sans selection:bg-purple-500/30 overflow-x-hidden">
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
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center border border-purple-500/20">
                <Beaker className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-white font-bold tracking-tight">ChemLab v4.0</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">KMnO₄ Redox Titration</p>
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
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] text-center md:text-left uppercase">
              REDOX<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400">ANALYSIS</span>
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
              <div className="max-w-lg space-y-2">
                <p className="text-zinc-500 text-sm md:text-base leading-relaxed text-center md:text-left">
                  Determining the strength of Potassium Permanganate solution by titrating against standard Oxalic Acid solution in acidic medium.
                </p>
                <div className="bg-purple-900/10 border border-purple-500/20 p-3 rounded-xl flex items-center gap-3">
                  <Info className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <p className="text-[10px] text-zinc-400 font-mono italic">
                    2KMnO₄ + 3H₂SO₄ + 5H₂C₂O₄ → K₂SO₄ + 2MnSO₄ + 8H₂O + 10CO₂
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 p-1 bg-zinc-800/20 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-3xl overflow-hidden">
          <div className="group bg-[#0a0a0a] p-8 space-y-3 transition-colors hover:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Pipette className="w-3.5 h-3.5 text-purple-500" />
              <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">KMnO₄ Molarity (M₂)</Label>
            </div>
            <div className="text-3xl font-mono font-bold text-white group-hover:text-purple-400 transition-colors">{step === 3 ? m2?.toFixed(4) : "???"}</div>
          </div>
          <div className="group bg-[#0a0a0a] p-8 space-y-3 transition-colors hover:bg-zinc-900/50 border-l border-white/5">
            <div className="flex items-center gap-2">
              <Beaker className="w-3.5 h-3.5 text-green-500" />
              <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Oxalic Molarity (M₁)</Label>
            </div>
            <Input value={m1} onChange={(e) => setM1(e.target.value)} className="bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-3xl font-mono font-bold text-green-500" />
          </div>
          <div className="group bg-[#0a0a0a] p-8 space-y-3 transition-colors hover:bg-zinc-900/50 border-l border-white/5">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-zinc-400" />
              <Label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Oxalic Volume (V₁)</Label>
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
                    <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5"><span className="text-xs text-zinc-500">Oxalic Acid</span><span className="text-xs text-zinc-300 font-mono">{m1}M (Standard)</span></div>
                    <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5"><span className="text-xs text-zinc-500">KMnO₄ Titrant</span><span className="text-xs text-zinc-300 font-mono">Unknown Strength</span></div>
                    <div className="flex justify-between p-3 bg-black/40 rounded-xl border border-white/5"><span className="text-xs text-zinc-500">Medium</span><span className="text-xs text-zinc-300">Dilute H₂SO₄</span></div>
                  </div>
                </div>
                <div className="p-8 bg-zinc-900/30 border border-white/5 rounded-3xl flex flex-col justify-center gap-6">
                  <p className="text-zinc-400 text-sm leading-relaxed italic font-serif">"Redox titrations require precise temperature control. Ensure the oxalic acid solution is heated to 60-70°C before adding the titrant."</p>
                  <Button onClick={proceedToObservation} className="h-16 bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg rounded-2xl transition-all shadow-[0_20px_40px_rgba(147,51,234,0.25)]">Enter Laboratory Deck</Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="lab" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-10">
                <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 p-12 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-8 left-8 space-y-6 z-20">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Temperature</p>
                      <motion.div 
                        key={temperature} 
                        className={`flex items-baseline gap-2 text-5xl font-mono font-bold tabular-nums transition-colors duration-500 ${temperature >= 60 ? "text-orange-500" : "text-blue-500"}`}
                      >
                        {temperature.toFixed(1)} <span className="text-xl">°C</span>
                        <div className="relative w-4 h-12 bg-zinc-800 rounded-full ml-4 overflow-hidden border border-white/5">
                           <motion.div 
                             className={`absolute bottom-0 left-0 w-full ${temperature >= 60 ? "bg-orange-500" : "bg-blue-500"}`} 
                             initial={{ height: "0%" }}
                             animate={{ height: `${(temperature / 100) * 100}%` }}
                           />
                        </div>
                      </motion.div>
                      {showHeatWarning && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase mt-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                          <AlertCircle className="w-3 h-3" />
                          <span>Solution must be between 60°C - 70°C to start!</span>
                        </motion.div>
                      )}
                    </div>
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
                            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-purple-900 via-purple-700 to-purple-800/80 border-t border-purple-400/40" 
                            initial={{ height: "100%" }} 
                            animate={{ height: `${Math.max(0, 100 - (simulatedValue / (parseFloat(buretteCapacity) || 50)) * 100)}%` }} 
                            transition={{ duration: 1, ease: "linear" }} 
                          />
                        </div>
                        
                        {/* Stopcock visualization */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                          <div className="w-1 h-6 bg-zinc-800/80" />
                          <motion.div 
                            className={`w-8 h-2 rounded-full shadow-xl z-20 cursor-pointer hover:scale-110 active:scale-95 transition-transform`}
                            onClick={() => activeTrialId !== null && setIsFlowing(!isFlowing)}
                            animate={{ 
                              rotate: isFlowing ? 90 : 0,
                              backgroundColor: isFlowing ? "#9333ea" : "#3f3f46"
                            }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          />
                          <div className="w-1 h-4 bg-zinc-800/80" />
                        </div>

                        {/* Drop Animation */}
                        {isFlowing && (
                          <motion.div 
                            className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-500/80 rounded-full blur-[1px]" 
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
                          <svg viewBox="0 0 100 100" className="w-full h-full fill-none drop-shadow-[0_0_30px_rgba(147,51,234,0.1)]">
                            <path d="M35 10 L65 10 L65 25 L85 90 L15 90 L35 25 Z" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                            <defs><clipPath id="flask-mask"><path d="M35 10 L65 10 L65 25 L85 90 L15 90 L35 25 Z" /></clipPath></defs>
                            <motion.path 
                              d="M0 60 H100 V100 H0 Z" 
                              clipPath="url(#flask-mask)" 
                              animate={{ 
                                fill: getFlaskFillColor()
                              }} 
                              transition={{ fill: { duration: 0.5 } }} 
                            />
                            {isHeating && (
                                <motion.path
                                    d="M20 95 Q 50 85 80 95"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                />
                            )}
                            <motion.circle cx="50" cy="75" r="25" className="blur-2xl" animate={{ fill: simulatedValue >= targetVolume ? "#ff007f60" : "transparent" }} transition={{ duration: 2 }} />
                          </svg>
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-3 bg-black rounded-full blur-md opacity-60" />
                      </div>
                    </div>

                    {/* Control Panel (Right Side) */}
                    <div className="w-56 flex flex-col justify-end gap-4 pb-12 z-30">
                      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 backdrop-blur-xl">
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] text-center">Protocol Controls</p>
                        
                        <Button
                            onClick={() => setIsHeating(!isHeating)}
                            className={`w-full h-16 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                                isHeating 
                                    ? "bg-orange-500 text-white border border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)]" 
                                    : temperature < 60 && activeTrialId === null 
                                      ? "bg-zinc-800/50 text-zinc-400 border border-orange-500/50 animate-pulse hover:bg-zinc-800 hover:text-white"
                                      : "bg-zinc-800/50 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-white"
                            }`}
                        >
                            <Flame className={`w-4 h-4 ${isHeating ? "animate-pulse" : ""}`} />
                            <span className="text-[10px] uppercase tracking-widest">{isHeating ? "Heating..." : "Heat Solution"}</span>
                        </Button>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[8px] uppercase font-black tracking-widest text-zinc-600">Flow Speed</span>
                            <span className="text-[8px] font-mono text-purple-500 font-bold">{flowSpeed.toFixed(2)} ml/s</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => setFlowSpeed(0.05)} 
                              className={`flex-1 h-8 text-[8px] rounded-lg border ${flowSpeed === 0.05 ? "bg-purple-600 border-purple-400 text-white" : "bg-zinc-900 border-white/5 text-zinc-500"}`}
                            >SLOW</Button>
                            <Button 
                              size="sm" 
                              onClick={() => setFlowSpeed(0.2)} 
                              className={`flex-1 h-8 text-[8px] rounded-lg border ${flowSpeed === 0.2 ? "bg-purple-600 border-purple-400 text-white" : "bg-zinc-900 border-white/5 text-zinc-500"}`}
                            >FAST</Button>
                          </div>
                        </div>

                        <Button 
                          onClick={() => setIsFlowing(!isFlowing)} 
                          disabled={activeTrialId === null} 
                          className={`w-full h-20 rounded-2xl font-bold transition-all flex flex-col items-center justify-center gap-2 active:scale-95 ${
                            isFlowing 
                              ? "bg-red-500 text-white border border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:bg-red-600" 
                              : activeTrialId !== null
                                ? "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_15px_30px_rgba(147,51,234,0.25)] hover:scale-[1.02]"
                                : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-white/5"
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
                      <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Trial #{activeTrialId} Active</span>
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
                          <TableRow key={trial.id} className={`border-white/5 transition-colors ${isActive ? "bg-purple-500/5" : "hover:bg-white/5"}`}>
                            <TableCell className="font-black text-zinc-500">#{trial.id.toString().padStart(2, '0')}</TableCell>
                            <TableCell className="font-mono text-zinc-400">{trial.initial}</TableCell>
                            <TableCell className="font-mono">{trial.final ? <span className="text-zinc-100">{trial.final}</span> : isActive ? <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-purple-500 font-bold">{simulatedValue.toFixed(2)}</motion.span> : <span className="text-zinc-800">—</span>}</TableCell>
                            <TableCell className="font-mono">{!isNaN(used) && used >= 0 ? <span className="text-green-500 font-bold">{used.toFixed(2)} ml</span> : <span className="text-zinc-800">—</span>}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => startTitration(trial.id)} 
                                disabled={activeTrialId !== null || trial.final !== ""} 
                                className={`h-8 px-4 text-[10px] font-black uppercase rounded-lg transition-all active:scale-95 ${trial.final ? "text-zinc-600 cursor-default" : "text-purple-500 hover:bg-purple-500/10 hover:text-purple-400 border border-transparent hover:border-purple-500/20"}`}
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
                    <div className="flex justify-between items-start"><div><h3 className="text-xl font-bold text-white tracking-tight">Final Analytics</h3><p className="text-xs text-zinc-500">Redox titration calculations based on KMnO₄ stoichiometry.</p></div><div className="p-2 rounded-xl bg-zinc-900 border border-white/5"><CheckCircle2 className="w-5 h-5 text-purple-500" /></div></div>
                    <div className="space-y-4">
                      <Button onClick={calculateResults} disabled={trials.some(t => !t.final) || step === 3} className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl transition-transform active:scale-95">ANALYZE EXPERIMENTAL DATA</Button>
                      <Button variant="outline" onClick={resetExperiment} className="w-full h-14 border-white/5 bg-transparent text-zinc-500 hover:text-zinc-100 hover:bg-white/5 rounded-2xl transition-all active:scale-95"><RotateCcw className="mr-2 h-4 w-4" /> RESTART SIMULATION</Button>
                    </div>
                    <AnimatePresence>
                      {step === 3 && m2 && strength && (
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="space-y-6 pt-4">
                          <div className="p-8 rounded-[1.5rem] bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl border border-white/20 relative overflow-hidden">
                            <motion.div 
                              className="absolute inset-0 bg-white/10" 
                              animate={{ x: ["-100%", "200%"] }} 
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }} 
                            />
                            <div className="space-y-8 relative z-10">
                              <div><p className="text-[10px] text-purple-100 font-black uppercase tracking-widest">Calculated Molarity (M₂)</p><p className="text-6xl font-mono font-black text-white tracking-tighter">{m2.toFixed(4)} <span className="text-sm font-sans opacity-60">M</span></p></div>
                              <div className="h-[1px] bg-white/10" />
                              <div><p className="text-[10px] text-purple-100 font-black uppercase tracking-widest">Strength of KMnO₄</p><p className="text-4xl font-mono font-black text-white tracking-tighter">{strength.toFixed(3)} <span className="text-sm font-sans opacity-60">g/L</span></p></div>
                            </div>
                          </div>
                          
                          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 space-y-4 shadow-inner">
                             <div className="flex justify-between items-center">
                               <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Concordant Volume (V₂)</span>
                               <span className="text-sm font-mono font-bold text-green-500">{concordantValue?.toFixed(2)} ml</span>
                             </div>
                             <div className="h-[1px] bg-white/5" />
                             <div className="space-y-3">
                               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Calculation Steps</p>
                               <div className="space-y-2 font-mono text-xs text-zinc-400">
                                 <div className="flex justify-between">
                                   <span>Formula:</span>
                                   <span className="text-zinc-200">M₁V₁/n₁ = M₂V₂/n₂</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <span>M₂ =</span>
                                   <span className="text-purple-400">(M₁ × V₁ × n₂) / (V₂ × n₁)</span>
                                 </div>
                                 <div className="flex justify-between border-t border-white/5 pt-2">
                                   <span>Substitution:</span>
                                   <span className="text-zinc-200">({m1} × {v1} × 2) / ({concordantValue?.toFixed(2)} × 5)</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <span>M₂ Result:</span>
                                   <span className="text-white font-bold">{m2.toFixed(4)} mol/L</span>
                                 </div>
                                 <div className="flex justify-between border-t border-white/5 pt-2">
                                   <span>Strength =</span>
                                   <span className="text-zinc-200">M₂ × 158.034</span>
                                 </div>
                                 <div className="flex justify-between">
                                   <span>Final Strength:</span>
                                   <span className="text-pink-400 font-bold">{strength.toFixed(3)} g/L</span>
                                 </div>
                               </div>
                             </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="p-8 rounded-[2rem] bg-gradient-to-b from-zinc-900/40 to-transparent border border-white/5 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Thermometer className="w-3 h-3" />
                    EXPERIMENTAL PROTOCOL
                  </h4>
                  <ul className="space-y-4">
                    {[
                      "Pipette out 10mL Oxalic acid and add 10mL Dil. H₂SO₄.", 
                      "Heat the solution to 60°C - 70°C (MANDATORY).", 
                      "Load a trial from the table and start KMnO₄ flow.", 
                      "Stop at appearance of permanent pale pink color.", 
                      "Identify concordant values for final calculation."
                    ].map((s, i) => (
                      <li key={i} className="flex gap-4 group cursor-help">
                        <span className="text-[10px] font-black text-purple-500 group-hover:scale-125 transition-transform">0{i+1}.</span>
                        <p className={`text-xs font-medium transition-colors ${i === 1 && temperature < 60 ? "text-orange-400 font-bold" : "text-zinc-400 group-hover:text-zinc-200"}`}>{s}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="fixed inset-0 pointer-events-none -z-10"><div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[150px] rounded-full animate-pulse" /><div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/5 blur-[150px] rounded-full animate-pulse" /></div>
    </div>
  );
}

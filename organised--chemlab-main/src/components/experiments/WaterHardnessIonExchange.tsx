"use client";

import React, { useState, useEffect, useRef } from "react";
import { Beaker, ArrowLeft, RotateCcw, Droplets, Info, CheckCircle2, AlertCircle, Play, Pause, Calculator, FlaskConical, Layers, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WaterHardnessIonExchangeProps {
  onBack: () => void;
}

export default function WaterHardnessIonExchange({ onBack }: WaterHardnessIonExchangeProps) {
  const [step, setStep] = useState(1);
  const [buretteVolume, setBuretteVolume] = useState(0);
  const [isTitrating, setIsTitrating] = useState(false);
  const [conicalFlaskContent, setConicalFlaskContent] = useState<string[]>([]);
  const [titrationComplete, setTitrationComplete] = useState(false);
  const [v2, setV2] = useState(0);
  const [calcInput, setCalcInput] = useState("");
  const [purificationInput, setPurificationInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPurificationCorrect, setIsPurificationCorrect] = useState<boolean | null>(null);
  const [isPassingThroughColumn, setIsPassingThroughColumn] = useState(false);
  const [columnProgress, setColumnProgress] = useState(0);

  // Constants for experiment
  const HARDNESS_SAMPLE = 450; // ppm (given original hardness)
  const VOLUME_HARD_WATER = 10; // mL
  const ENDPOINT = 0.5; // mL EDTA for purified water (very low hardness)
  const titrationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPassingThroughColumn) {
      const interval = setInterval(() => {
        setColumnProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPassingThroughColumn(false);
            setStep(3);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPassingThroughColumn]);

  useEffect(() => {
    if (isTitrating && !titrationComplete) {
      titrationInterval.current = setInterval(() => {
        setBuretteVolume(prev => {
          const next = prev + 0.05;
          if (next >= ENDPOINT) {
            setTitrationComplete(true);
            setIsTitrating(false);
            setV2(parseFloat(next.toFixed(2)));
            return parseFloat(next.toFixed(2));
          }
          return parseFloat(next.toFixed(2));
        });
      }, 100);
    } else {
      if (titrationInterval.current) clearInterval(titrationInterval.current);
    }
    return () => {
      if (titrationInterval.current) clearInterval(titrationInterval.current);
    };
  }, [isTitrating, titrationComplete]);

  const addComponent = (comp: string) => {
    if (!conicalFlaskContent.includes(comp)) {
      setConicalFlaskContent(prev => [...prev, comp]);
    }
  };

  const reset = () => {
    setStep(1);
    setBuretteVolume(0);
    setIsTitrating(false);
    setConicalFlaskContent([]);
    setTitrationComplete(false);
    setV2(0);
    setCalcInput("");
    setPurificationInput("");
    setIsCorrect(null);
    setIsPurificationCorrect(null);
    setIsPassingThroughColumn(false);
    setColumnProgress(0);
  };

  const getFlaskColor = () => {
    if (!conicalFlaskContent.includes("indicator")) return "bg-blue-100/30";
    if (titrationComplete) return "bg-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.4)]";
    if (buretteVolume > ENDPOINT - 0.2) return "bg-purple-500/60";
    return "bg-red-900/60 shadow-[0_0_20px_rgba(153,27,27,0.4)]";
  };

  const checkResult = () => {
    const val = parseFloat(calcInput);
    const expected = v2 * 100;
    if (Math.abs(val - expected) < 1) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const checkPurification = () => {
    const val = parseFloat(purificationInput);
    const hardnessPurified = v2 * 100;
    const expected = ((HARDNESS_SAMPLE - hardnessPurified) / HARDNESS_SAMPLE) * 100;
    if (Math.abs(val - expected) < 0.1) {
      setIsPurificationCorrect(true);
    } else {
      setIsPurificationCorrect(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Experiment 10</h1>
              <p className="text-[10px] text-blue-500 font-black tracking-[0.3em] uppercase">Hardness of Water by Ion Exchange Resin</p>
            </div>
          </div>
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Lab
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Theory & Procedure Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-white font-bold tracking-tight uppercase">Principle</h3>
              </div>
              <div className="space-y-4 text-xs text-zinc-500 leading-relaxed italic">
                <p>
                  Ion-exchange resin consists of organic polymer beads with functional groups that exchange ions. Cation-exchange resins (like Amberlite IR120) replace metal ions (Ca²⁺, Mg²⁺) with H⁺ ions.
                </p>
                <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 space-y-1 font-mono text-[10px]">
                  <div className="text-blue-400">1 mL 0.01M EDTA = 1 mg CaCO₃</div>
                  <div className="text-zinc-400">Sample Hardness = (V2 × 1000) / V</div>
                  <div className="text-zinc-600">% Purification = ((H_initial - H_purified) / H_initial) × 100</div>
                </div>
              </div>
              
              <div className="space-y-3 pt-4">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Procedure Steps</span>
                <div className="space-y-2">
                  {[
                    "Pass 10 mL hard water through Column",
                    "Collect effluent in conical flask",
                    "Add buffer & indicator",
                    "Titrate with 0.01M EDTA"
                  ].map((s, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${step === i + 1 ? 'bg-blue-600/10 border-blue-500/40 text-blue-400' : 'bg-zinc-950 border-white/5 text-zinc-600'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === i + 1 ? 'bg-blue-500 text-white' : 'bg-zinc-800'}`}>
                        {i + 1}
                      </div>
                      <span className="text-[11px] font-medium">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Observation Table */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 space-y-4">
              <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">Observations</h3>
              <div className="bg-black/40 rounded-2xl overflow-hidden border border-white/5">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-zinc-900/50 text-zinc-500 border-b border-white/5">
                      <th className="p-4 text-left">Parameter</th>
                      <th className="p-4 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-zinc-400">Original Hardness</td>
                      <td className="p-4 text-right font-mono text-zinc-300">{HARDNESS_SAMPLE} ppm</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-zinc-400 italic">Volume of Effluent</td>
                      <td className="p-4 text-right font-mono text-white">10 mL</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-zinc-400 italic">EDTA Consumed (V2)</td>
                      <td className="p-4 text-right font-mono text-blue-400">{v2 > 0 ? v2.toFixed(2) : "---"} mL</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Virtual Apparatus Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden min-h-[650px] flex flex-col items-center justify-center gap-8 shadow-2xl">
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-blue-950/10 to-transparent pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full">
                {/* Ion Exchange Column */}
                <div className="relative flex flex-col items-center">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Ion Exchange Column</span>
                  <div className="relative w-12 h-64 border-4 border-white/10 rounded-full bg-white/[0.02] overflow-hidden">
                    {/* Resin Beads (Visual Representation) */}
                    <div className="absolute inset-x-0 bottom-0 top-0 bg-amber-500/20 flex flex-wrap content-start p-1 gap-1">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-600/40" />
                      ))}
                    </div>
                    {/* Water flowing through */}
                    {isPassingThroughColumn && (
                      <motion.div 
                        initial={{ top: -20 }}
                        animate={{ top: `${columnProgress}%` }}
                        className="absolute inset-x-0 h-4 bg-blue-400/40 blur-[2px]"
                      />
                    )}
                  </div>
                  {/* Drip animation from column */}
                  {isPassingThroughColumn && columnProgress > 90 && (
                    <motion.div 
                      animate={{ y: [0, 80], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-1.5 h-3 bg-blue-400/60 rounded-full"
                    />
                  )}
                </div>

                {/* Burette Setup */}
                <div className="relative h-96 w-24 flex flex-col items-center">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Burette</span>
                  <div className="absolute top-8 w-2 h-full bg-white/5 border-x border-white/10 rounded-full" />
                  <div 
                    className="absolute bottom-12 w-2 bg-blue-400/30 transition-all duration-300"
                    style={{ top: `calc(2rem + ${(buretteVolume / 25) * 80}%)` }}
                  />
                  <div className="absolute bottom-0 w-8 h-12 flex flex-col items-center">
                     <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 relative z-10 cursor-pointer hover:bg-zinc-700 transition-colors"
                          onClick={() => step === 4 && setIsTitrating(!isTitrating)}>
                       <div className={`w-1 h-4 bg-zinc-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform ${isTitrating ? 'rotate-90' : 'rotate-0'}`} />
                     </div>
                     <div className="w-1 h-8 bg-white/10 border-x border-white/20" />
                  </div>
                  {isTitrating && (
                    <motion.div 
                      animate={{ y: [0, 40], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.4 }}
                      className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-1 h-2 bg-blue-400 rounded-full blur-[1px]"
                    />
                  )}
                </div>

                {/* Conical Flask */}
                <div className="relative pt-12">
                  <div className="relative w-48 h-56 flex flex-col items-center">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-b-[4rem] rounded-t-[1rem] bg-white/[0.02] backdrop-blur-sm z-10 overflow-hidden">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: conicalFlaskContent.length > 0 || columnProgress > 0 ? '45%' : 0 }}
                        className={`absolute bottom-0 w-full transition-colors duration-1000 ${getFlaskColor()}`}
                      />
                    </div>
                    <div className="absolute -top-12 w-12 h-16 border-4 border-white/10 rounded-t-xl bg-white/[0.02] z-10" />
                  </div>
                </div>
              </div>

              {/* Interaction UI */}
              <div className="absolute top-10 right-10 flex flex-col gap-4">
                {step === 1 && (
                  <button 
                    onClick={() => { setIsPassingThroughColumn(true); setStep(2); }}
                    className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    <Layers className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Pass Hard Water Through Column</span>
                  </button>
                )}
                {step === 3 && (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => addComponent("buffer")}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${conicalFlaskContent.includes("buffer") ? "bg-zinc-800 text-zinc-500" : "bg-purple-600 text-white shadow-lg shadow-purple-600/20"}`}
                      disabled={conicalFlaskContent.includes("buffer")}
                    >
                      <Beaker className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Add Buffer</span>
                    </button>
                    <button 
                      onClick={() => { addComponent("indicator"); setStep(4); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${conicalFlaskContent.includes("indicator") ? "bg-zinc-800 text-zinc-500" : "bg-red-600 text-white shadow-lg shadow-red-600/20"}`}
                      disabled={!conicalFlaskContent.includes("buffer")}
                    >
                      <Droplets className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Add Indicator</span>
                    </button>
                  </div>
                )}
              </div>

              {step === 4 && (
                <div className="absolute bottom-10 right-10 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between gap-8">
                    <div>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Burette Reading</span>
                      <div className="text-3xl font-mono font-black text-blue-400">{buretteVolume.toFixed(2)} <span className="text-xs text-zinc-600">mL</span></div>
                    </div>
                    <button 
                      onClick={() => setIsTitrating(!isTitrating)}
                      disabled={titrationComplete}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        isTitrating ? 'bg-amber-500 text-black' : 'bg-emerald-600 text-white'
                      } ${titrationComplete ? 'opacity-20 grayscale' : 'hover:scale-105 active:scale-95 shadow-lg'}`}
                    >
                      {isTitrating ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>
                  </div>
                  {titrationComplete && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      End Point (Blue)
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Calculation Section */}
            <AnimatePresence>
              {titrationComplete && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0a0a0a] border border-blue-500/20 rounded-[3rem] p-10 space-y-10 shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Experiment Analysis</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Calculations & Results</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Part 1: Purified Water Hardness */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase">Phase 1</span>
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest">Hardness of Purified Water</h4>
                      </div>
                      
                      <div className="bg-zinc-950 p-6 rounded-[2rem] border border-white/5 space-y-4">
                        <div className="space-y-2 font-mono text-xs">
                          <div className="flex justify-between text-zinc-500">
                            <span>1 mL 0.01 M EDTA</span>
                            <span className="text-zinc-300">1 mg CaCO₃</span>
                          </div>
                          <div className="flex justify-between text-zinc-500">
                            <span>{v2} mL 0.01 M EDTA</span>
                            <span className="text-blue-400 font-bold">{v2} mg CaCO₃</span>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                          <p className="font-mono italic text-[11px] text-blue-400">
                            Hardness = (V2 × 1000) / 10<br />
                            Hardness = ({v2} × 1000) / 10<br />
                            Hardness = {v2 * 100} ppm
                          </p>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Enter Purified Hardness (ppm)</span>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={calcInput}
                              onChange={(e) => setCalcInput(e.target.value)}
                              placeholder="Value..."
                              className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                            />
                            <button 
                              onClick={checkResult}
                              className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase px-6 rounded-xl transition-all"
                            >
                              Verify
                            </button>
                          </div>
                          {isCorrect !== null && (
                            <div className={`text-[10px] font-bold uppercase flex items-center gap-2 ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                              {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {isCorrect ? 'Correct' : 'Incorrect calculation'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Part 2: Percent Purification */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">Phase 2</span>
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest">Efficiency of Purification</h4>
                      </div>

                      <div className="bg-zinc-950 p-6 rounded-[2rem] border border-white/5 space-y-4">
                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                          <p className="font-mono italic text-[11px] text-emerald-400">
                            % Purification = ((H_initial - H_purified) / H_initial) × 100<br />
                            % Purification = (({HARDNESS_SAMPLE} - {v2 * 100}) / {HARDNESS_SAMPLE}) × 100
                          </p>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Enter % Purification</span>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={purificationInput}
                              onChange={(e) => setPurificationInput(e.target.value)}
                              placeholder="Percentage..."
                              className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                            />
                            <button 
                              onClick={checkPurification}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase px-6 rounded-xl transition-all"
                            >
                              Verify
                            </button>
                          </div>
                          {isPurificationCorrect !== null && (
                            <div className={`text-[10px] font-bold uppercase flex items-center gap-2 ${isPurificationCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                              {isPurificationCorrect ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {isPurificationCorrect ? 'Purification Efficiency Verified' : 'Check your percentage calculation'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Final Result Card */}
                  {(isCorrect && isPurificationCorrect) && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                    >
                      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                          <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Experiment Result</h3>
                          <div className="space-y-1 text-white/70 text-[10px] font-mono italic">
                            <p>Hardness_purified = (V2 × 1000) / 10 = ({v2} × 1000) / 10 = {v2 * 100} ppm</p>
                            <p>% Purification = (({HARDNESS_SAMPLE} - {v2 * 100}) / {HARDNESS_SAMPLE}) × 100 = {(((HARDNESS_SAMPLE - (v2 * 100)) / HARDNESS_SAMPLE) * 100).toFixed(1)}%</p>
                          </div>
                          <p className="text-white/70 text-sm leading-relaxed">
                            The ion exchange resin successfully removed {(((HARDNESS_SAMPLE - (v2 * 100)) / HARDNESS_SAMPLE) * 100).toFixed(1)}% of hardness from the water sample.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] block mb-1">Purified Hardness</span>
                            <div className="text-2xl font-black text-white">{v2 * 100} <span className="text-xs font-medium opacity-60">ppm</span></div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] block mb-1">Efficiency</span>
                            <div className="text-2xl font-black text-white">{(((HARDNESS_SAMPLE - (v2 * 100)) / HARDNESS_SAMPLE) * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

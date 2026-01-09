"use client";

import React, { useState, useEffect, useRef } from "react";
import { Beaker, ArrowLeft, RotateCcw, Droplets, Info, CheckCircle2, AlertCircle, Play, Pause, ChevronRight, Calculator, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WaterHardnessEDTAProps {
  onBack: () => void;
}

export default function WaterHardnessEDTA({ onBack }: WaterHardnessEDTAProps) {
  const [step, setStep] = useState(1);
  const [buretteVolume, setBuretteVolume] = useState(0);
  const [isTitrating, setIsTitrating] = useState(false);
  const [conicalFlaskContent, setConicalFlaskContent] = useState<string[]>([]); // ["water", "buffer", "indicator"]
  const [titrationComplete, setTitrationComplete] = useState(false);
  const [v1, setV1] = useState(0);
  const [calcInput, setCalcInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Real endpoint for this simulation (e.g., 10.5 mL)
  const ENDPOINT = 10.5;
  const titrationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTitrating && !titrationComplete) {
      titrationInterval.current = setInterval(() => {
        setBuretteVolume(prev => {
          const next = prev + 0.1;
          if (next >= ENDPOINT) {
            setTitrationComplete(true);
            setIsTitrating(false);
            setV1(parseFloat(next.toFixed(1)));
            return parseFloat(next.toFixed(1));
          }
          return parseFloat(next.toFixed(1));
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
    setV1(0);
    setCalcInput("");
    setIsCorrect(null);
  };

  const getFlaskColor = () => {
    if (!conicalFlaskContent.includes("indicator")) return "bg-blue-100/30"; // Just water/buffer
    if (titrationComplete) return "bg-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.4)]"; // Pale blue end point
    if (buretteVolume > ENDPOINT - 1) return "bg-purple-500/60"; // Violet transition
    return "bg-red-900/60 shadow-[0_0_20px_rgba(153,27,27,0.4)]"; // Wine red
  };

  const checkResult = () => {
    const val = parseFloat(calcInput);
    const expected = v1 * 100;
    if (Math.abs(val - expected) < 1) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
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
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Experiment 4</h1>
              <p className="text-[10px] text-blue-500 font-black tracking-[0.3em] uppercase">Estimation of Water Hardness (EDTA)</p>
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
                  <h3 className="text-white font-bold tracking-tight uppercase">Principle & Theory</h3>
                </div>
                <div className="space-y-4 text-xs text-zinc-500 leading-relaxed italic">
                  <p>
                    Water hardness is a measure of the concentration of polyvalent cations (Ca²⁺ and Mg²⁺). It is often reported as ppm of calcium carbonate.
                  </p>
                  <p>
                    The estimation is based on complexometric titration. Ca²⁺ and Mg²⁺ ions react with EDTA to form colorless stable complexes at pH 9-10.
                  </p>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 space-y-1 font-mono text-[10px]">
                    <div className="text-blue-400">1 mL 0.01M EDTA = 1 mg CaCO₃</div>
                    <div className="text-zinc-600">Sample Hardness = (V1 × 1000) / V</div>
                  </div>
                </div>
              
              <div className="space-y-3 pt-4">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Procedure Steps</span>
                <div className="space-y-2">
                  {[
                    "Pipette 10 mL hard water into flask",
                    "Add 2 mL buffer solution (pH 10)",
                    "Add Calamagite indicator (Wine Red)",
                    "Titrate with 0.01M EDTA until Blue"
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
                      <th className="p-4 text-left">Sample</th>
                      <th className="p-4 text-right">EDTA (mL)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-zinc-400 italic">Hard Water (10mL)</td>
                      <td className="p-4 text-right font-mono text-blue-400">{v1 > 0 ? v1.toFixed(1) : "---"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Virtual Apparatus Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden min-h-[600px] flex flex-col md:flex-row items-center justify-center gap-16 shadow-2xl">
              {/* Lab Bench Effect */}
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-blue-950/10 to-transparent pointer-events-none" />
              
              {/* Burette Setup */}
              <div className="relative h-96 w-24 flex flex-col items-center">
                <div className="absolute top-0 w-2 h-full bg-white/5 border-x border-white/10 rounded-full" />
                {/* Liquid in Burette */}
                <div 
                  className="absolute bottom-12 w-2 bg-blue-400/30 transition-all duration-300"
                  style={{ top: `${(buretteVolume / 25) * 80}%`, borderLeft: '1px solid #60a5fa33' }}
                />
                {/* Scale markings */}
                <div className="absolute inset-y-0 right-0 w-4 flex flex-col justify-between py-2 pointer-events-none opacity-20">
                  {[0,5,10,15,20,25].map(m => <div key={m} className="text-[8px] font-mono">{m}</div>)}
                </div>
                {/* Burette Tip & Stopcock */}
                <div className="absolute bottom-0 w-8 h-12 flex flex-col items-center">
                   <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 relative z-10 cursor-pointer hover:bg-zinc-700 transition-colors"
                        onClick={() => step === 4 && setIsTitrating(!isTitrating)}>
                     <div className={`w-1 h-4 bg-zinc-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform ${isTitrating ? 'rotate-90' : 'rotate-0'}`} />
                   </div>
                   <div className="w-1 h-8 bg-white/10 border-x border-white/20" />
                </div>
                {/* Drop animation */}
                {isTitrating && (
                  <motion.div 
                    animate={{ y: [0, 40], opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.4 }}
                    className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-1 h-2 bg-blue-400 rounded-full blur-[1px]"
                  />
                )}
              </div>

              {/* Conical Flask */}
              <div className="relative group">
                <div className="relative w-48 h-56 flex flex-col items-center">
                  {/* Flask Shape */}
                  <div className="absolute inset-0 border-4 border-white/10 rounded-b-[4rem] rounded-t-[1rem] bg-white/[0.02] backdrop-blur-sm z-10 overflow-hidden">
                    {/* Liquid Level */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: conicalFlaskContent.length > 0 ? '40%' : 0 }}
                      className={`absolute bottom-0 w-full transition-colors duration-1000 ${getFlaskColor()}`}
                    />
                  </div>
                  {/* Flask Neck */}
                  <div className="absolute -top-12 w-12 h-16 border-4 border-white/10 rounded-t-xl bg-white/[0.02] z-10" />
                </div>
                
                {/* Interactive Tooltips */}
                <div className="absolute -top-32 -left-16 flex flex-col gap-4">
                  {step === 1 && (
                    <button 
                      onClick={() => { addComponent("water"); setStep(2); }}
                      className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                    >
                      <Droplets className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Add 10mL Hard Water</span>
                    </button>
                  )}
                  {step === 2 && (
                    <button 
                      onClick={() => { addComponent("buffer"); setStep(3); }}
                      className="flex items-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-600/20 active:scale-95 transition-all"
                    >
                      <Beaker className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Add 2mL Buffer (pH 10)</span>
                    </button>
                  )}
                  {step === 3 && (
                    <button 
                      onClick={() => { addComponent("indicator"); setStep(4); }}
                      className="flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-600/20 active:scale-95 transition-all"
                    >
                      <Droplets className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Add Calamagite Indicator</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Titration Controls (Float) */}
              {step === 4 && (
                <div className="absolute bottom-10 right-10 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between gap-8">
                    <div>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Burette Reading</span>
                      <div className="text-3xl font-mono font-black text-blue-400">{buretteVolume.toFixed(1)} <span className="text-xs text-zinc-600">mL</span></div>
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
                      End Point Reached (Blue)
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
                  className="bg-[#0a0a0a] border border-blue-500/20 rounded-[3rem] p-10 space-y-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tighter uppercase">Analytical Calculation</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Total Hardness Estimation</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
                      <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex justify-between"><span>Volume of hard water (V)</span><span className="text-white font-bold">10 mL</span></div>
                        <div className="flex justify-between"><span>Volume of EDTA (V1)</span><span className="text-blue-400 font-bold">{v1} mL</span></div>
                        <div className="flex justify-between"><span>Molarity of EDTA</span><span className="text-white font-bold">0.01 M</span></div>
                      </div>
                        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                          <p className="font-mono italic text-[11px] text-blue-400">
                            Hardness = (V1 × 1000) / V<br />
                            Hardness = ({v1} × 1000) / 10 ppm<br />
                            Hardness = {v1 * 100} ppm
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Final Result (ppm)</span>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            value={calcInput}
                            onChange={(e) => setCalcInput(e.target.value)}
                            placeholder="Enter ppm value..."
                            className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                          />
                          <button 
                            onClick={checkResult}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase px-8 rounded-2xl transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                          >
                            Verify Result
                          </button>
                        </div>

                        {isCorrect !== null && (
                          <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-6 rounded-2xl border flex items-center gap-4 ${
                            isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            <div>
                                <span className="text-sm font-black uppercase tracking-widest block">
                                  {isCorrect ? 'Result Verified' : 'Calculation Error'}
                                </span>
                                <div className="text-[10px] opacity-70 leading-relaxed mt-1">
                                  {isCorrect 
                                    ? (
                                      <div className="space-y-1">
                                        <p>Hardness = (V1 × 1000) / V = ({v1} × 1000) / 10 = {v1 * 100} ppm</p>
                                        <p className="font-bold text-white uppercase tracking-tighter italic">Total Hardness: {calcInput} ppm (or) mg/L</p>
                                      </div>
                                    ) 
                                    : 'Please re-check your multiplication factors.'}
                                </div>

                            </div>
                          </motion.div>
                        )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

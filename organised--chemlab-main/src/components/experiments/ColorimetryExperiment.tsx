"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Beaker, ArrowLeft, Play, Power, RotateCcw, Info, BarChart3, FlaskConical, Droplet, CheckCircle2, AlertCircle, ChevronUp, ChevronDown, Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";

interface ColorimetryExperimentProps {
  onBack: () => void;
}

const wavelengths = [430, 470, 490, 520, 540, 550, 610];
const concentrations = [0.1, 0.2, 0.3, 0.4, 0.5];

const UNKNOWN_CONC = 0.35;

export default function ColorimetryExperiment({ onBack }: ColorimetryExperimentProps) {
  const [isPowered, setIsPowered] = useState(false);
  const [selectedWavelength, setSelectedWavelength] = useState(540);
  const [wlInput, setWlInput] = useState("540");
  const [isZeroed, setIsZeroed] = useState(false);
  const [baseline, setBaseline] = useState(0);
  const [currentCuvette, setCurrentCuvette] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<{ conc: number | string, abs: number }[]>([]);
  const [wavelengthMeasurements, setWavelengthMeasurements] = useState<{ wl: number, abs: number }[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [calcInput, setCalcInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [activeTable, setActiveTable] = useState<"lambda" | "concentration">("lambda");
  const [statusMessage, setStatusMessage] = useState("Switch ON the power to begin.");

  useEffect(() => {
    if (!isPowered) {
      setStatusMessage("Switch ON the power to begin.");
    } else if (!currentCuvette) {
      setStatusMessage("Select a cuvette from the tray.");
    } else if (!isZeroed) {
      setStatusMessage(currentCuvette === "water" ? "Press SET ZERO to calibrate." : "Place Distilled Water and press SET ZERO.");
    } else if (activeTable === "lambda") {
      setStatusMessage("Press MEASURE to record absorbance for Table 1.");
    } else {
      setStatusMessage("Press MEASURE to record absorbance for Table 2.");
    }
  }, [isPowered, isZeroed, activeTable, currentCuvette]);

  // Simulation Logic: Absorbance = epsilon * concentration
  const calculateAbsorbance = (wl: number, conc: number) => {
    if (!isPowered) return 0;
    // KMnO4 peak is around 540nm. 
    const peakWL = 540;
    const sigma = 50; 
    const peakEpsilon = 2.23;
    const normalizedWL = Math.exp(-Math.pow(wl - peakWL, 2) / (2 * Math.pow(sigma, 2)));
    const currentEpsilon = normalizedWL * peakEpsilon;
    
    const baseAbs = currentEpsilon * (conc / 0.1) * 0.15;
    // Add small random noise
    return Math.max(0, baseAbs + (Math.random() * 0.004 - 0.002));
  };

  const rawAbsorbance = useMemo(() => {
    if (!isPowered || !currentCuvette) return 0;
    const noise = (Math.random() * 0.002 - 0.001);
    if (currentCuvette === "water") return 0.015 + noise;
    
    const conc = currentCuvette === "unknown" ? UNKNOWN_CONC : parseFloat(currentCuvette);
    const abs = calculateAbsorbance(selectedWavelength, conc);
    return abs + 0.015; 
  }, [isPowered, currentCuvette, selectedWavelength]);

  const currentAbsorbance = useMemo(() => {
    if (!isPowered) return 0;
    if (!isZeroed) return rawAbsorbance;
    return Math.max(0, rawAbsorbance - baseline);
  }, [isPowered, isZeroed, rawAbsorbance, baseline]);

  const handlePower = () => {
    const nextPower = !isPowered;
    setIsPowered(nextPower);
    if (!nextPower) {
      setIsZeroed(false);
      setBaseline(0);
      setCurrentCuvette(null);
    }
  };

    const handleZero = () => {
      if (!isPowered) return;
      if (currentCuvette === "water") {
        setBaseline(rawAbsorbance);
        setIsZeroed(true);
      } else {
        setStatusMessage("Please insert Distilled Water first!");
      }
    };

  const changeWavelength = (wl: number) => {
    if (!isPowered) return;
    const safeWl = Math.max(400, Math.min(700, wl));
    setSelectedWavelength(safeWl);
    setWlInput(safeWl.toString());
    setIsZeroed(false);
  };

  const handleWlInputChange = (val: string) => {
    setWlInput(val);
    const num = parseInt(val);
    if (!isNaN(num)) {
      if (num >= 400 && num <= 700) {
        setSelectedWavelength(num);
        setIsZeroed(false);
      }
    }
  };

  const handleMeasure = () => {
    if (!isPowered || !currentCuvette || !isZeroed) return;

    const absVal = parseFloat(currentAbsorbance.toFixed(3));

    if (activeTable === "concentration") {
      if (currentCuvette === "unknown") {
        setMeasurements(prev => {
          const filtered = prev.filter(m => m.conc !== "Unknown");
          return [...filtered, { conc: "Unknown", abs: absVal }];
        });
      } else {
        const concNum = parseFloat(currentCuvette);
        setMeasurements(prev => {
          const filtered = prev.filter(m => m.conc !== concNum);
          return [...filtered, { conc: concNum, abs: absVal }];
        });
      }
    } else {
      setWavelengthMeasurements(prev => {
        const filtered = prev.filter(w => w.wl !== selectedWavelength);
        return [...filtered, { wl: selectedWavelength, abs: absVal }];
      });
    }
  };

  const resetExperiment = () => {
    setMeasurements([]);
    setWavelengthMeasurements([]);
    setIsZeroed(false);
    setBaseline(0);
    setCalcInput("");
    setIsCorrect(null);
  };

  const checkResult = () => {
    const val = parseFloat(calcInput);
    if (Math.abs(val - UNKNOWN_CONC) < 0.05) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

    const chartData = useMemo(() => {
      if (activeTable === "concentration") {
        const points = measurements
          .filter(m => typeof m.conc === 'number')
          .sort((a, b) => (a.conc as number) - (b.conc as number))
          .map(m => ({
            x: m.conc,
            y: parseFloat(m.abs.toFixed(3)),
            isUnknown: false
          }));

        const unknownPoint = measurements.find(m => m.conc === "Unknown");
        if (unknownPoint) {
          // If we want to show it on the line, we'd need to know its concentration, 
          // but since it's "Unknown", we'll just plot it as a special point if the user has verified it or just show its y-level
          points.push({
            x: UNKNOWN_CONC, 
            y: parseFloat(unknownPoint.abs.toFixed(3)),
            isUnknown: true
          });
        }
        return points;
      } else {
        return wavelengthMeasurements
          .sort((a, b) => a.wl - b.wl)
          .map(w => ({
            x: w.wl,
            y: parseFloat(w.abs.toFixed(3)),
            isUnknown: false
          }));
      }
    }, [measurements, wavelengthMeasurements, activeTable]);


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
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Experiment 3</h1>
              <p className="text-[10px] text-blue-500 font-black tracking-[0.3em] uppercase">Digital Colorimeter Simulation</p>
            </div>
          </div>
          <button 
            onClick={resetExperiment}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Data
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Console */}
          <div className="lg:col-span-8 space-y-6">
            {/* Status Guide */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Zap className="w-32 h-32 text-blue-500" />
               </div>
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                   <Info className="w-5 h-5 text-blue-500" />
                 </div>
                 <h3 className="text-white font-bold tracking-tight uppercase">Operational Protocol</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-medium">
                 <div className={`p-4 rounded-2xl border transition-all ${isPowered ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-zinc-900/50 border-white/5 text-zinc-500'}`}>
                   <span className="block mb-1 opacity-50 font-black tracking-[0.2em] uppercase">Step 01</span>
                   Power on the device using the red master switch.
                 </div>
                 <div className={`p-4 rounded-2xl border transition-all ${isPowered && currentCuvette === 'water' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-zinc-900/50 border-white/5 text-zinc-500'}`}>
                   <span className="block mb-1 opacity-50 font-black tracking-[0.2em] uppercase">Step 02</span>
                   Insert distilled water and press SET ZERO to calibrate.
                 </div>
                 <div className={`p-4 rounded-2xl border transition-all ${isZeroed ? 'bg-purple-500/5 border-purple-500/20 text-purple-400' : 'bg-zinc-900/50 border-white/5 text-zinc-500'}`}>
                   <span className="block mb-1 opacity-50 font-black tracking-[0.2em] uppercase">Step 03</span>
                   Set filter (wavelength) for λmax or keep at 540nm.
                 </div>
                 <div className={`p-4 rounded-2xl border transition-all ${measurements.length > 0 ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' : 'bg-zinc-900/50 border-white/5 text-zinc-500'}`}>
                   <span className="block mb-1 opacity-50 font-black tracking-[0.2em] uppercase">Step 04</span>
                   Measure unknown and standards to plot calibration curve.
                 </div>
               </div>
            </div>

            {/* Virtual Device */}
            <div className="relative bg-zinc-900 rounded-[3rem] border-[12px] border-zinc-800 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] p-8 md:p-10 flex flex-col gap-8 overflow-hidden">
              {/* Device Texture */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
              
              {/* Guidance Display */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-3 z-30">
                <div className={`w-2 h-2 rounded-full ${isPowered ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-zinc-800'} ${isPowered ? 'animate-pulse' : ''}`} />
                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em]">
                  {statusMessage}
                </span>
              </div>

              {/* Main Display Panel */}
              <div className="bg-[#050505] border-4 border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 relative z-20 shadow-[inset_0_4px_20px_rgba(0,0,0,1)] mt-4">
                {/* Absorbance Display */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 italic">Absorbance (O.D.)</span>
                    <div className="flex gap-2">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${isZeroed ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800 text-zinc-600'}`}>Zeroed</div>
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${isPowered ? 'bg-blue-500/20 text-blue-500' : 'bg-zinc-800 text-zinc-600'}`}>Ready</div>
                    </div>
                  </div>
                    <div className="bg-zinc-900/50 rounded-2xl h-20 md:h-28 flex items-center justify-center border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-red-500/[0.02] pointer-events-none" />
                      <span className={`text-5xl md:text-7xl font-mono tracking-tighter transition-all duration-300 ${isPowered ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'text-zinc-900'}`}>
                        {isPowered ? currentAbsorbance.toFixed(3) : "0.000"}
                      </span>
                    </div>
                  </div>
  
                  {/* Wavelength Selection */}
                  <div className="w-full md:w-48 space-y-3">
                    <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 italic block px-1 text-center">Filter (nm)</span>
                    <div className="bg-zinc-900/50 rounded-2xl h-20 md:h-28 flex items-center justify-center border border-white/5 relative overflow-hidden group">
                      <input
                        type="text"
                        value={isPowered ? wlInput : "---"}
                        onChange={(e) => handleWlInputChange(e.target.value)}
                        disabled={!isPowered}
                        className={`bg-transparent text-center text-4xl md:text-6xl font-mono tracking-tighter border-none outline-none w-full transition-all duration-300 ${isPowered ? 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]' : 'text-zinc-900'}`}
                      />

                    {isPowered && (
                      <div className="absolute top-2 right-4 text-[8px] font-black text-blue-500/50 uppercase tracking-widest">Digital</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interaction Row */}
              <div className="grid grid-cols-12 gap-4 md:gap-6 items-center relative z-20">
                {/* Master Power */}
                <div className="col-span-3 md:col-span-2">
                  <button 
                    onClick={handlePower}
                    className={`w-full aspect-square rounded-2xl border-4 transition-all flex flex-col items-center justify-center gap-1 group active:scale-95 ${
                      isPowered 
                        ? 'bg-red-500/10 border-red-500/40 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-600 hover:bg-zinc-700'
                    }`}
                  >
                    <Power className={`w-6 h-6 transition-transform group-hover:scale-110 ${isPowered ? 'animate-pulse' : ''}`} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Power</span>
                  </button>
                </div>

                {/* Sample Chamber */}
                <div className="col-span-4 md:col-span-4 flex justify-center">
                  <div className="w-full h-16 md:h-20 bg-zinc-950 border-4 border-zinc-800 rounded-t-3xl relative group shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[80%] h-[80%] border-2 border-zinc-800 rounded-lg bg-black/40 flex items-center justify-center overflow-hidden">
                      {currentCuvette ? (
                        <motion.div 
                          initial={{ y: -40, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="w-10 md:w-12 h-14 relative"
                        >
                          <div className="absolute inset-0 border-2 border-white/20 rounded-sm z-20" />
                          <div 
                            className="absolute bottom-0 w-full rounded-sm transition-all duration-700 z-10"
                            style={{ 
                              height: '90%', 
                              backgroundColor: currentCuvette === 'water' ? '#60a5fa44' : '#d946ef',
                              boxShadow: currentCuvette === 'water' ? 'inset 0 0 10px #60a5fa22' : 'inset 0 0 20px #d946ef44',
                              opacity: currentCuvette === 'water' ? 0.4 : 0.8
                            }} 
                          />
                        </motion.div>
                      ) : (
                        <div className="text-[7px] text-zinc-700 font-black uppercase tracking-[0.1em] text-center">Empty</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="col-span-5 md:col-span-6 grid grid-cols-3 gap-2 md:gap-4">
                  {/* WL Adjust */}
                  <div className="bg-zinc-950 border-2 border-zinc-800 rounded-xl p-1 flex flex-col gap-0.5">
                    <button 
                      disabled={!isPowered}
                      onClick={() => changeWavelength(selectedWavelength + 10)}
                      className="flex-1 hover:bg-white/5 rounded-md flex items-center justify-center transition-colors disabled:opacity-20"
                    >
                      <ChevronUp className="w-4 h-4 text-blue-500" />
                    </button>
                    <button 
                      disabled={!isPowered}
                      onClick={() => changeWavelength(selectedWavelength - 10)}
                      className="flex-1 hover:bg-white/5 rounded-md flex items-center justify-center transition-colors disabled:opacity-20"
                    >
                      <ChevronDown className="w-4 h-4 text-blue-500" />
                    </button>
                  </div>

                  {/* Set Zero */}
                  <button 
                    disabled={!isPowered}
                    onClick={handleZero}
                    className={`rounded-xl border-4 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                      isPowered && currentCuvette === 'water' 
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 hover:bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-pulse' 
                        : isZeroed && isPowered ? 'bg-green-500/10 border-green-500/40 text-green-500' : 'bg-zinc-800 border-zinc-700 text-zinc-600'
                    }`}
                  >
                    <div className="relative">
                      <RotateCcw className={`w-5 h-5 ${isZeroed && isPowered ? 'text-green-500' : ''}`} />
                      {isZeroed && isPowered && <Check className="w-3 h-3 absolute -top-1 -right-1 text-green-500 bg-black rounded-full p-0.5" />}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest">Zero</span>
                  </button>

                  {/* Measure */}
                  <button 
                    disabled={!isPowered}
                    onClick={() => {
                      if (!isZeroed) {
                        setStatusMessage("System must be ZEROED first!");
                        return;
                      }
                      if (!currentCuvette) {
                        setStatusMessage("Insert a cuvette to measure!");
                        return;
                      }
                      handleMeasure();
                    }}
                    className={`rounded-xl border-4 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 ${
                      isPowered && isZeroed && currentCuvette
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-600'
                    }`}
                  >
                    <Play className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Measure</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tray & Observation Table */}
          <div className="lg:col-span-4 space-y-6">
            {/* Cuvette Tray */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-purple-500" />
                  Cuvette Tray
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setCurrentCuvette('water')}
                  className={`aspect-square rounded-2xl border-2 transition-all group relative overflow-hidden ${
                    currentCuvette === 'water' ? 'bg-blue-500/20 border-blue-500/50 shadow-lg' : 'bg-zinc-900 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <div className="w-5 h-10 border border-blue-400/30 rounded-sm relative overflow-hidden">
                      <div className="absolute bottom-0 w-full h-[70%] bg-blue-400/20" />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-zinc-400">Dist. Water</span>
                  </div>
                </button>

                {concentrations.map(c => (
                  <button 
                    key={c}
                    onClick={() => setCurrentCuvette(c.toString())}
                    className={`aspect-square rounded-2xl border-2 transition-all group relative overflow-hidden ${
                      currentCuvette === c.toString() ? 'bg-purple-500/20 border-purple-500/50 shadow-lg' : 'bg-zinc-900 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <div className="w-5 h-10 border border-purple-400/30 rounded-sm relative overflow-hidden">
                        <div className="absolute bottom-0 w-full h-[70%] bg-purple-600/60" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-tighter text-zinc-400">{c} mM</span>
                    </div>
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentCuvette('unknown')}
                  className={`aspect-square rounded-2xl border-2 transition-all group relative overflow-hidden ${
                    currentCuvette === 'unknown' ? 'bg-amber-500/20 border-amber-500/50 shadow-lg' : 'bg-zinc-900 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <div className="w-5 h-10 border border-amber-400/30 rounded-sm relative overflow-hidden">
                      <div className="absolute bottom-0 w-full h-[70%] bg-purple-600/60" />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-amber-500">Unknown</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Observation Tables */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 space-y-4">
              <div className="flex p-1 bg-zinc-950 rounded-xl border border-white/5">
                <button 
                  onClick={() => setActiveTable("lambda")}
                  className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    activeTable === "lambda" ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  λmax Determination
                </button>
                <button 
                  onClick={() => setActiveTable("concentration")}
                  className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    activeTable === "concentration" ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  Beer-Lambert Law
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-zinc-500 border-b border-white/5">
                      <th className="py-3 text-left font-black uppercase tracking-widest">S.No</th>
                      <th className="py-3 text-left font-black uppercase tracking-widest">
                        {activeTable === "lambda" ? "Filter (nm)" : "Conc. (mM)"}
                      </th>
                      <th className="py-3 text-right font-black uppercase tracking-widest">Abs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTable === "lambda" ? (
                      wavelengthMeasurements.map((w, idx) => (
                        <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 group transition-colors">
                          <td className="py-3 text-zinc-600">{idx + 1}</td>
                          <td className="py-3 font-bold text-white">{w.wl} nm</td>
                          <td className="py-3 text-right font-bold text-blue-400">{w.abs.toFixed(3)}</td>
                        </tr>
                      ))
                    ) : (
                      measurements.map((m, idx) => (
                        <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 group transition-colors">
                          <td className="py-3 text-zinc-600">{idx + 1}</td>
                          <td className="py-3 font-bold text-white">{m.conc} {m.conc !== "Unknown" ? "mM" : ""}</td>
                          <td className="py-3 text-right font-bold text-blue-400">{m.abs.toFixed(3)}</td>
                        </tr>
                      ))
                    )}
                    {((activeTable === "lambda" && wavelengthMeasurements.length === 0) || 
                      (activeTable === "concentration" && measurements.length === 0)) && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-zinc-700 font-bold uppercase tracking-widest italic opacity-50">No Data Captured</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {(wavelengthMeasurements.length > 0 || measurements.length > 0) && (
                <button 
                  onClick={() => setShowGraph(true)}
                  className="w-full py-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  View Analytics Graph
                </button>
              )}
            </div>

            {/* Calculations */}
            <AnimatePresence>
              {measurements.some(m => m.conc === "Unknown") && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-950 border border-blue-500/20 rounded-[2rem] p-6 space-y-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                >
                  <h3 className="text-white font-bold text-[10px] uppercase tracking-[0.2em]">Concentration Analysis</h3>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Based on the Beer-Lambert plot, the unknown sample with absorbance 
                    <span className="text-blue-400 font-black mx-1">
                      {measurements.find(m => m.conc === "Unknown")?.abs.toFixed(3)}
                    </span>
                    has a molarity of:
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      step="0.01"
                      value={calcInput}
                      onChange={(e) => setCalcInput(e.target.value)}
                      placeholder="Enter mM value..."
                      className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-800 focus:outline-none focus:border-blue-500/50"
                    />
                    <button 
                      onClick={checkResult}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                    >
                      Verify
                    </button>
                  </div>
                  {isCorrect !== null && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-4 rounded-xl border flex items-center gap-3 ${
                      isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {isCorrect ? 'Correct Calibration!' : 'Calibration Error. Review Slope.'}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Graph Modal */}
        <AnimatePresence>
          {showGraph && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl"
            >
                <motion.div 
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] w-full max-w-5xl p-6 md:p-10 space-y-8 relative shadow-[0_50px_100px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Analytical Graphics</h2>
                      <p className="text-[10px] text-blue-500 font-black tracking-[0.3em] uppercase">
                        {activeTable === "lambda" ? "Spectral Response: Absorbance vs Wavelength" : "Beer-Lambert Plot: Absorbance vs Concentration"}
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowGraph(false)}
                      className="p-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 flex items-center gap-2 group"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Close View</span>
                      <ArrowLeft className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                  </div>

                  <div className="h-[350px] md:h-[450px] w-full bg-zinc-950/50 rounded-3xl p-6 border border-white/5 relative">
                     <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 20 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#1a1a1a" vertical={false} />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name={activeTable === "lambda" ? "Wavelength" : "Concentration"} 
                          unit={activeTable === "lambda" ? "nm" : "mM"} 
                          stroke="#333" 
                          fontSize={10}
                          fontWeight="bold"
                          tick={{ fill: '#666' }}
                          domain={activeTable === "lambda" ? [400, 700] : [0, 0.6]}
                          label={{ value: activeTable === "lambda" ? "Wavelength (nm)" : "Concentration (mM)", position: 'bottom', offset: 20, fill: '#666', fontSize: 10, fontWeight: 'black', textAnchor: 'middle' }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name="Absorbance" 
                          stroke="#333" 
                          fontSize={10}
                          fontWeight="bold"
                          tick={{ fill: '#666' }}
                          domain={[0, 'auto']}
                          label={{ value: "Absorbance (O.D.)", angle: -90, position: 'left', offset: 0, fill: '#666', fontSize: 10, fontWeight: 'black', textAnchor: 'middle' }}
                        />
                          <ZAxis type="number" range={[100, 100]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '16px', fontSize: '10px', color: '#fff' }}
                          itemStyle={{ color: '#60a5fa' }}
                          cursor={{ strokeDasharray: '3 3', stroke: '#333' }} 
                        />
                          <Scatter 
                            name="Standards" 
                            data={chartData?.filter(p => !p.isUnknown)} 
                            fill={activeTable === "lambda" ? "#3b82f6" : "#a855f7"} 
                            line={{ stroke: activeTable === "lambda" ? "#3b82f6" : "#a855f7", strokeWidth: 2 }}
                            shape="circle"
                            isAnimationActive={true}
                          />
                          {activeTable === "concentration" && (
                            <Scatter 
                              name="Unknown Sample" 
                              data={chartData?.filter(p => p.isUnknown)} 
                              fill="#f59e0b" 
                              shape="star"
                              isAnimationActive={true}
                            />
                          )}

                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Observation</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {activeTable === "lambda" 
                          ? "The curve shows maximum absorbance at approximately 540nm, confirming the λmax for KMnO4." 
                          : "The linear plot confirms that absorbance is directly proportional to concentration (Beer's Law)."}
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Equation</span>
                      <p className="text-xs text-zinc-400 font-mono italic">
                        {activeTable === "lambda" ? "A = f(λ)" : "A = ε · c · l"}
                      </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Conclusion</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        The experimental data matches theoretical predictions with high fidelity.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-center">
                    <button 
                      onClick={() => setShowGraph(false)}
                      className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all active:scale-95"
                    >
                      Back to Experiment
                    </button>
                  </div>
                </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

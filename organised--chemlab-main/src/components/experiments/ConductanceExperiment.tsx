"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Beaker, Zap, ArrowLeft, RotateCcw, Thermometer, Droplets, Play, CheckCircle2, FlaskConical, ChevronRight, Activity, Waves } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ConductanceExperimentProps {
  onBack: () => void;
}

const EQUIVALENT_CONDUCTIVITIES: Record<string, number> = {
  "H+": 350.0,
  "Na+": 50.1,
  "K+": 73.5,
  "Cl-": 76.3,
  "OH-": 198.0,
};

const SALT_CONDUCTIVITIES: Record<string, number> = {
  HCl: 426.1,
  NaCl: 126.4,
  KCl: 150.0,
};

const ConductanceSimulation = ({ salt, conductance, isMeasuring }: { salt: string; conductance: number | null; isMeasuring: boolean }) => {
  return (
    <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden h-[450px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(245,158,11,0.05),transparent)] pointer-events-none" />
      
      <div className="relative h-full flex flex-col items-center justify-end pb-8">
        {/* Conductometer Display */}
        <div className="absolute top-0 right-0 p-4 bg-zinc-900/80 border border-white/10 rounded-2xl backdrop-blur-md z-20 w-48">
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase font-black text-amber-500 tracking-widest mb-1">CONDUCTOMETER</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-mono font-bold text-white tabular-nums">
                {isMeasuring ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {(Math.random() * 50).toFixed(2)}
                  </motion.span>
                ) : conductance || "0.00"}
              </span>
              <span className="text-xs text-zinc-500 font-bold">mS/cm</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isMeasuring ? "bg-amber-500 animate-pulse" : "bg-zinc-800"}`} />
              <span className="text-[8px] text-zinc-600 font-black uppercase">Sampling...</span>
            </div>
          </div>
        </div>

        {/* Hot Plate & Water Bath */}
        <div className="relative flex flex-col items-center">
          {/* Conductivity Probe */}
          <motion.div 
            className="absolute -top-32 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
            animate={{ y: isMeasuring ? [0, 2, 0] : 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-1 h-32 bg-zinc-700" />
            <div className="w-6 h-12 bg-zinc-800 border-2 border-white/10 rounded-b-xl flex justify-center gap-1 p-1">
              <div className="w-1.5 h-full bg-zinc-400 rounded-full opacity-50" />
              <div className="w-1.5 h-full bg-zinc-400 rounded-full opacity-50" />
            </div>
            
            {/* Ionic Activity Particles */}
            {isMeasuring && Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-36 w-1 h-1 bg-amber-400 rounded-full"
                animate={{
                  y: [0, 20],
                  x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: Math.random()
                }}
              />
            ))}
          </motion.div>

          {/* 500mL Beaker (Water Bath) */}
          <div className="relative w-64 h-48 border-2 border-white/10 border-t-0 rounded-b-[3rem] bg-blue-500/5 backdrop-blur-sm overflow-hidden flex items-center justify-center">
            <div className="absolute bottom-0 w-full h-[85%] bg-blue-400/10" />
            
            {/* 250mL Sample Beaker */}
            <div className="relative w-32 h-36 border-2 border-white/20 border-t-0 rounded-b-[2rem] bg-white/10 overflow-hidden">
              <motion.div 
                className="absolute bottom-0 w-full bg-amber-500/20"
                initial={{ height: "0%" }}
                animate={{ height: "70%" }}
              />
              
              {/* Thermometer */}
              <div className="absolute left-4 -top-8 w-1.5 h-40 bg-white/20 rounded-full overflow-hidden">
                <div className="absolute bottom-0 w-full h-24 bg-red-500" />
                <div className="absolute bottom-0 w-full h-2 w-full bg-red-600 rounded-full" />
              </div>

              {/* Bubbles if "heating" */}
              <div className="absolute bottom-0 w-full flex justify-around">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-white/20 rounded-full"
                    animate={{
                      y: [0, -60],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Hot Plate Base */}
          <div className="mt-2 w-72 h-16 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between px-8 shadow-2xl">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-800 flex items-center justify-center">
                  <div className="w-1 h-3 bg-zinc-700 rounded-full rotate-45" />
                </div>
                <span className="text-[6px] uppercase font-black text-zinc-600">Temp</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-800 flex items-center justify-center">
                  <div className="w-1 h-3 bg-zinc-700 rounded-full -rotate-12" />
                </div>
                <span className="text-[6px] uppercase font-black text-zinc-600">Stir</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-red-500/50">25.0 °C</span>
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              </div>
              <span className="text-[6px] uppercase font-black text-zinc-600">System Stable</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function ConductanceExperiment({ onBack }: ConductanceExperimentProps) {
  const [step, setStep] = useState(1);
  const [table1Data, setTable1Data] = useState<{ salt: string; conductance: number | null }[]>([
    { salt: "0.1M HCl", conductance: null },
    { salt: "0.1M NaCl", conductance: null },
    { salt: "0.1M KCl", conductance: null },
  ]);
  const [table2Data, setTable2Data] = useState<{ volume: number; concentration: number; conductance: number | null }[]>([
    { volume: 20, concentration: 0.1, conductance: null },
    { volume: 24, concentration: 0.0833, conductance: null },
    { volume: 28, concentration: 0.0714, conductance: null },
    { volume: 32, concentration: 0.0625, conductance: null },
    { volume: 36, concentration: 0.0556, conductance: null },
    { volume: 40, concentration: 0.05, conductance: null },
  ]);
  const [currentMeasurement, setCurrentMeasurement] = useState(0);
  const [table1Complete, setTable1Complete] = useState(false);
  const [table2Complete, setTable2Complete] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const calculateConductance = (salt: string, concentration: number): number => {
    const lambdaInf = SALT_CONDUCTIVITIES[salt.replace("0.1M ", "")] || 126.4;
    const kappa = lambdaInf * concentration * 0.001;
    const noise = (Math.random() - 0.5) * 0.5;
    return parseFloat((kappa * 1000 + noise).toFixed(2));
  };

  const measureTable1 = async () => {
    if (currentMeasurement >= 3 || isMeasuring) return;
    setIsMeasuring(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const saltName = table1Data[currentMeasurement].salt.replace("0.1M ", "");
    const conductance = calculateConductance(saltName, 0.1);
    
    setTable1Data(prev => {
      const newData = [...prev];
      newData[currentMeasurement] = { ...newData[currentMeasurement], conductance };
      return newData;
    });
    
    setIsMeasuring(false);
    if (currentMeasurement === 2) {
      setTable1Complete(true);
      setStep(2);
      setCurrentMeasurement(0);
    } else {
      setCurrentMeasurement(prev => prev + 1);
    }
  };

  const measureTable2 = async () => {
    if (currentMeasurement >= 6 || isMeasuring) return;
    setIsMeasuring(true);
    await new Promise(r => setTimeout(r, 1500));

    const concentration = table2Data[currentMeasurement].concentration;
    const conductance = calculateConductance("NaCl", concentration);
    
    setTable2Data(prev => {
      const newData = [...prev];
      newData[currentMeasurement] = { ...newData[currentMeasurement], conductance };
      return newData;
    });
    
    setIsMeasuring(false);
    if (currentMeasurement === 5) {
      setTable2Complete(true);
      setStep(3);
    } else {
      setCurrentMeasurement(prev => prev + 1);
    }
  };

  const highestConductingCation = useMemo(() => {
    if (!table1Complete) return null;
    const hclCond = table1Data[0].conductance || 0;
    const naclCond = table1Data[1].conductance || 0;
    const kclCond = table1Data[2].conductance || 0;
    
    if (hclCond > naclCond && hclCond > kclCond) return "H⁺";
    if (kclCond > naclCond) return "K⁺";
    return "Na⁺";
  }, [table1Complete, table1Data]);

  const resetExperiment = () => {
    setStep(1);
    setTable1Data([
      { salt: "0.1M HCl", conductance: null },
      { salt: "0.1M NaCl", conductance: null },
      { salt: "0.1M KCl", conductance: null },
    ]);
    setTable2Data([
      { volume: 20, concentration: 0.1, conductance: null },
      { volume: 24, concentration: 0.0833, conductance: null },
      { volume: 28, concentration: 0.0714, conductance: null },
      { volume: 32, concentration: 0.0625, conductance: null },
      { volume: 36, concentration: 0.0556, conductance: null },
      { volume: 40, concentration: 0.05, conductance: null },
    ]);
    setCurrentMeasurement(0);
    setTable1Complete(false);
    setTable2Complete(false);
  };

  const chartData = useMemo(() => {
    return table2Data
      .filter(d => d.conductance !== null)
      .map(d => ({
        concentration: d.concentration.toFixed(4),
        conductance: d.conductance,
      }));
  }, [table2Data]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-6 md:p-12 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
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
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center border border-amber-500/20">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-white font-bold tracking-tight">ChemLab v4.0</h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Conductometry Module</p>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={resetExperiment}
            className="border-white/5 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>

        {/* Hero */}
        <header className="relative py-4">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] text-center md:text-left">
              CONDUCTANCE<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">MEASUREMENT</span>
            </h1>
            <p className="text-zinc-500 max-w-2xl text-sm leading-relaxed">
              Study the conductance of electrolyte solutions at various concentrations. Observe how ionic mobility affects electrical conductivity in aqueous solutions.
            </p>
          </motion.div>
        </header>

        {/* Progress Steps */}
        <div className="flex items-center gap-4">
          {[
            { num: 1, label: "Salt Comparison" },
            { num: 2, label: "Dilution Study" },
            { num: 3, label: "Results" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-4">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
                step >= s.num 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                  : "bg-zinc-900/50 border-white/5 text-zinc-600"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                  step > s.num ? "bg-amber-500 text-black" : step === s.num ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800"
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">{s.label}</span>
              </div>
              {i < 2 && <div className={`w-12 h-[2px] ${step > s.num ? "bg-amber-500/50" : "bg-zinc-800"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel: Theory & Procedure */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-6 border-b border-white/5 bg-amber-500/5">
                <CardTitle className="text-white flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Principle
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs text-zinc-500 leading-relaxed">
                <p>
                  Electrolyte solutions conduct electricity via ion movement. Cations move toward the cathode, anions toward the anode, and their combined movement constitutes the total current flow.
                </p>
                <p>
                  <strong className="text-zinc-300">Strong electrolytes</strong> (HCl, NaCl, KCl) dissociate completely, while <strong className="text-zinc-300">weak electrolytes</strong> (CH₃COOH) only partially ionize.
                </p>
                <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 font-mono text-[10px] space-y-1">
                  <div className="text-amber-400">Λ (HCl) = 426.1 S·cm²·mol⁻¹</div>
                  <div className="text-zinc-400">Λ (NaCl) = 126.4 S·cm²·mol⁻¹</div>
                  <div className="text-zinc-400">Λ (KCl) = 150.0 S·cm²·mol⁻¹</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-6 border-b border-white/5">
                <CardTitle className="text-white text-sm">Ionic Conductivities at 25°C</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 bg-zinc-900/30">
                      <TableHead className="text-[9px] uppercase font-black text-zinc-600">Ion</TableHead>
                      <TableHead className="text-[9px] uppercase font-black text-zinc-600 text-right">Λ (S·cm²·mol⁻¹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { ion: "H⁺", value: 350.0, highlight: true },
                      { ion: "Na⁺", value: 50.1 },
                      { ion: "K⁺", value: 73.5 },
                      { ion: "Cl⁻", value: 76.3 },
                      { ion: "OH⁻", value: 198.0 },
                    ].map(row => (
                      <TableRow key={row.ion} className="border-white/5">
                        <TableCell className={`text-xs ${row.highlight ? "text-amber-400 font-bold" : ""}`}>{row.ion}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{row.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

            {/* Right Panel: Experiment Workspace */}
            <div className="lg:col-span-8 space-y-6">
              <ConductanceSimulation 
                salt={step === 1 ? table1Data[currentMeasurement]?.salt : "NaCl"} 
                conductance={step === 1 ? table1Data[currentMeasurement]?.conductance : table2Data[currentMeasurement]?.conductance} 
                isMeasuring={isMeasuring} 
              />
              <AnimatePresence mode="wait">

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <CardHeader className="p-6 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent">
                      <CardTitle className="text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Beaker className="w-5 h-5 text-amber-500" />
                          Table 1: Conductance of 0.1M Solutions
                        </span>
                        <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">298 K</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5 bg-zinc-900/30">
                            <TableHead className="text-[10px] uppercase font-black text-zinc-500">S.No.</TableHead>
                            <TableHead className="text-[10px] uppercase font-black text-zinc-500">Solution</TableHead>
                            <TableHead className="text-[10px] uppercase font-black text-zinc-500 text-right">Conductance (mS/cm)</TableHead>
                          </TableRow>
                        </TableHeader>
                          <TableBody>
                            {table1Data.map((row, i) => (
                              <TableRow key={i} className={`border-white/5 ${currentMeasurement === i && !table1Complete ? "bg-amber-500/5" : ""}`}>
                                <TableCell className="font-mono text-xs text-zinc-400">{i + 1}</TableCell>
                                <TableCell className="text-xs text-zinc-100 font-medium">{row.salt}</TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                  {row.conductance !== null ? (
                                    <span className="text-amber-400">{row.conductance}</span>
                                  ) : (
                                    <span className="text-zinc-700">---</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4">
                    <Button
                      onClick={measureTable1}
                      disabled={table1Complete}
                      className="flex-1 h-16 bg-amber-600 hover:bg-amber-500 text-black font-black rounded-2xl shadow-xl shadow-amber-600/20 transition-all active:scale-95"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {table1Complete ? "MEASUREMENTS COMPLETE" : `MEASURE ${table1Data[currentMeasurement]?.salt}`}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                    <CardHeader className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-transparent">
                      <CardTitle className="text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Droplets className="w-5 h-5 text-blue-500" />
                          Table 2: Conductance vs NaCl Concentration
                        </span>
                        <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">298 K</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5 bg-zinc-900/30">
                            <TableHead className="text-[10px] uppercase font-black text-zinc-500">S.No.</TableHead>
                            <TableHead className="text-[10px] uppercase font-black text-zinc-500">Volume (mL)</TableHead>
                            <TableHead className="text-[10px] uppercase font-black text-zinc-500">Conc. (M)</TableHead>
                            <TableHead className="text-[10px] uppercase font-black text-zinc-500 text-right">Conductance (mS/cm)</TableHead>
                          </TableRow>
                        </TableHeader>
                          <TableBody>
                            {table2Data.map((row, i) => (
                              <TableRow key={i} className={`border-white/5 ${currentMeasurement === i && !table2Complete ? "bg-blue-500/5" : ""}`}>
                                <TableCell className="font-mono text-xs text-zinc-400">{i + 1}</TableCell>
                                <TableCell className="text-xs text-zinc-400">{i === 0 ? "20" : `${table2Data[i-1].volume} + 4`}</TableCell>
                                <TableCell className="text-xs font-mono text-zinc-400">{row.concentration.toFixed(4)}</TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                  {row.conductance !== null ? (
                                    <span className="text-blue-400">{row.conductance}</span>
                                  ) : (
                                    <span className="text-zinc-700">---</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4">
                    <Button
                      onClick={measureTable2}
                      disabled={table2Complete}
                      className="flex-1 h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {table2Complete ? "DILUTION STUDY COMPLETE" : `MEASURE AT ${table2Data[currentMeasurement]?.volume} mL`}
                    </Button>
                  </div>

                  {chartData.length > 0 && (
                    <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] p-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Conductance vs Concentration</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                            <XAxis dataKey="concentration" stroke="#52525b" fontSize={10} />
                            <YAxis stroke="#52525b" fontSize={10} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            />
                            <Line type="monotone" dataKey="conductance" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Results Summary */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                      <div className="relative z-10 space-y-6">
                        <div>
                          <p className="text-[10px] text-amber-200 uppercase font-black tracking-widest mb-2">Table 1 Result</p>
                          <h3 className="text-2xl font-black text-white tracking-tight">Highest Conducting Cation</h3>
                        </div>
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                          <p className="text-5xl font-black text-white text-center">{highestConductingCation}</p>
                        </div>
                        <p className="text-amber-100 text-xs leading-relaxed">
                          H⁺ has the highest equivalent conductivity (350.0 S·cm²·mol⁻¹) due to the Grotthuss mechanism of proton hopping.
                        </p>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                      <div className="relative z-10 space-y-6">
                        <div>
                          <p className="text-[10px] text-blue-200 uppercase font-black tracking-widest mb-2">Table 2 Observation</p>
                          <h3 className="text-2xl font-black text-white tracking-tight">Concentration Effect</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                            <span className="text-xs text-blue-200">Initial (0.1M)</span>
                            <span className="font-mono font-bold text-white">{table2Data[0].conductance} mS/cm</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                            <span className="text-xs text-blue-200">Final (0.05M)</span>
                            <span className="font-mono font-bold text-white">{table2Data[5].conductance} mS/cm</span>
                          </div>
                        </div>
                        <p className="text-blue-100 text-xs leading-relaxed">
                          Conductance decreases with dilution as fewer charge carriers are available per unit volume.
                        </p>
                      </div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                    </Card>
                  </div>

                  {/* Final Graph */}
                  <Card className="bg-[#0a0a0a] border-white/5 rounded-[2rem] p-8 shadow-xl">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6">Conductance vs NaCl Concentration (Final Plot)</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                          <XAxis 
                            dataKey="concentration" 
                            stroke="#52525b" 
                            fontSize={10} 
                            label={{ value: 'Concentration (M)', position: 'insideBottom', offset: -5, fill: '#71717a', fontSize: 10 }}
                          />
                          <YAxis 
                            stroke="#52525b" 
                            fontSize={10}
                            label={{ value: 'Conductance (mS/cm)', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 10 }}
                          />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              formatter={(value: any) => [`${value} mS/cm`, 'Conductance']}
                              labelFormatter={(label) => `Conc: ${label} M`}
                            />
                          <Line 
                            type="monotone" 
                            dataKey="conductance" 
                            stroke="#f59e0b" 
                            strokeWidth={3} 
                            dot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} 
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Conclusion */}
                  <Card className="bg-zinc-900/50 border-white/5 rounded-[2rem] p-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-4">Conclusion</h3>
                    <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                      <p>
                        <strong className="text-white">From Table 1:</strong> The cation with the highest conducting ability is <strong className="text-amber-400">{highestConductingCation}</strong>. 
                        This is due to the exceptionally high ionic mobility of hydrogen ions via the Grotthuss (proton-hopping) mechanism in aqueous solution.
                      </p>
                      <p>
                        <strong className="text-white">From Table 2:</strong> As NaCl solution is progressively diluted from 0.1M to 0.05M, 
                        the measured conductance decreases linearly. This demonstrates that specific conductance is directly proportional to 
                        the concentration of ions in the solution.
                      </p>
                    </div>
                  </Card>

                  <Button onClick={onBack} className="w-full h-14 bg-zinc-900 border border-white/5 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all">
                    CLOSE EXPERIMENT
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-600/5 blur-[150px] rounded-full animate-pulse" />
      </div>
    </div>
  );
}

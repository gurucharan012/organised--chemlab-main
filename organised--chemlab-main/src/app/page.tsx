"use client";

import React, { useState } from "react";
import { Beaker, FlaskConical, Microscope, TestTube, Thermometer, Droplet, Atom, Layers, ArrowRight, Activity, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VolumetricStudy from "@/components/experiments/VolumetricStudy";
import KMnO4Titration from "@/components/experiments/KMnO4Titration";
import ColorimetryExperiment from "@/components/experiments/ColorimetryExperiment";
import WaterHardnessEDTA from "@/components/experiments/WaterHardnessEDTA";
import WaterHardnessIonExchange from "@/components/experiments/WaterHardnessIonExchange";
import PotentiometryHCl from "@/components/experiments/PotentiometryHCl";
import ConductanceExperiment from "@/components/experiments/ConductanceExperiment";
import PHMetricStudies from "@/components/experiments/PHMetricStudies";

const experiments = [
  {
    id: "exp13",
    name: "1. pH-Metric Studies",
    description: "Determine the molarity of HCl by monitoring pH changes during titration with standard NaOH.",
    icon: Activity,
    color: "blue",
    component: PHMetricStudies
  },
  {
    id: "exp1",
    name: "2. Volumetric Studies",
    description: "Quantitative analysis to determine the concentration of hydrochloric acid using standard NaOH.",
    icon: Beaker,
    color: "blue",
    component: VolumetricStudy
  },
  {
    id: "exp2",
    name: "3. Strength of KMnO4",
    description: "Determine the molarity and strength of KMnO4 solution by titrating with standard 0.1M oxalic acid.",
    icon: Droplet,
    color: "purple",
    component: KMnO4Titration
  },
  {
    id: "exp3",
    name: "4. Calorimetric Studies",
    description: "Determine the concentration of KMnO4 solution using colorimetric analysis and Beer-Lambert law.",
    icon: Microscope,
    color: "emerald",
    component: ColorimetryExperiment
  },
  {
    id: "exp4",
    name: "5. Estimation of Water Hardness by EDTA",
    description: "Determine total hardness of water using complexometric titration with standard EDTA solution.",
    icon: FlaskConical,
    color: "blue",
    component: WaterHardnessEDTA
  },
  {
    id: "exp10",
    name: "6. Hardness of Water by Ion Exchange",
    description: "Remove Ca2+ and Mg2+ ions from hard water using ion exchange resin and calculate purification efficiency.",
    icon: Layers,
    color: "amber",
    component: WaterHardnessIonExchange
  },
  {
    id: "exp11",
    name: "7. Potentiometry",
    description: "Determine HCl molarity by potentiometric titration using 0.1M NaOH and measuring EMF change.",
    icon: Activity,
    color: "indigo",
    component: PotentiometryHCl
  },
  {
    id: "exp12",
    name: "8. Conductance Measurement of Electrolytes",
    description: "Study conductance of electrolyte solutions (HCl, NaCl, KCl) at various concentrations.",
    icon: Zap,
    color: "amber",
    component: ConductanceExperiment
  }
];

export default function Home() {
  const [activeExp, setActiveExp] = useState<string | null>(null);

  if (activeExp === "exp1") {
    return <VolumetricStudy onBack={() => setActiveExp(null)} />;
  }

  if (activeExp === "exp2") {
    return <KMnO4Titration onBack={() => setActiveExp(null)} />;
  }

  if (activeExp === "exp3") {
    return <ColorimetryExperiment onBack={() => setActiveExp(null)} />;
  }

  if (activeExp === "exp4") {
    return <WaterHardnessEDTA onBack={() => setActiveExp(null)} />;
  }

  if (activeExp === "exp10") {
    return <WaterHardnessIonExchange onBack={() => setActiveExp(null)} />;
  }

  if (activeExp === "exp11") {
    return <PotentiometryHCl onBack={() => setActiveExp(null)} />;
  }

  if (activeExp === "exp12") {
    return <ConductanceExperiment onBack={() => setActiveExp(null)} />;
  }

  if (activeExp === "exp13") {
    return <PHMetricStudies onBack={() => setActiveExp(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 p-6 md:p-12 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
              <Beaker className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-white font-bold tracking-tight">ChemLab v4.0</h2>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Virtual Laboratory Environment</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">System Ready</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <header className="relative py-4">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "circOut" }} 
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] text-center md:text-left">
              EXPERIMENT<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">DASHBOARD</span>
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
              <p className="text-zinc-500 max-w-lg text-sm md:text-base leading-relaxed text-center md:text-left">
                Select an analytical procedure to begin your virtual practical session. All simulations follow standard laboratory protocols.
              </p>
            </div>
          </motion.div>
        </header>

        {/* Experiment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiments.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveExp(exp.id)}
              className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 space-y-6 transition-all duration-500 hover:border-blue-500/50 hover:bg-zinc-900/50 cursor-pointer shadow-xl hover:shadow-blue-500/10"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors duration-500 bg-blue-600/10 border-blue-500/20 group-hover:bg-blue-600/20 group-hover:border-blue-500/40">
                <exp.icon className="w-6 h-6 text-blue-500" />
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-bold tracking-tight text-lg group-hover:text-blue-400 transition-colors">
                  {exp.name}
                </h3>
                <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                  {exp.description}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-500 group-hover:translate-x-1 transition-transform">
                  <span className="text-[10px] uppercase font-black tracking-widest">Launch Experiment</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Decorative Gradient for Hover */}
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse" />
      </div>
    </div>
  );
}

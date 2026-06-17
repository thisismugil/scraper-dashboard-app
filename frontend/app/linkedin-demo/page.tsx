'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, Database, Eye, Terminal, Layers, RefreshCw } from 'lucide-react';

export default function LinkedInIncidentMode() {
  const [demoCounter, setDemoCounter] = useState(0);
  const [linkedinCounter, setLinkedinCounter] = useState(0);
  const [runCounters, setRunCounters] = useState(true);

  useEffect(() => {
    if (!runCounters) return;

    // 1. Animate demo counter to 100
    const demoDuration = 1500;
    const demoSteps = 100;
    const demoIntervalTime = demoDuration / demoSteps;
    let currentDemo = 0;
    const demoTimer = setInterval(() => {
      currentDemo += 1;
      if (currentDemo >= 100) {
        setDemoCounter(100);
        clearInterval(demoTimer);
      } else {
        setDemoCounter(currentDemo);
      }
    }, demoIntervalTime);

    // 2. Animate LinkedIn counter to 700,000,000
    // We use exponential increment for rapid counter visual effects
    const linkedinTarget = 700000000;
    const linkedinDuration = 2000;
    const startTime = Date.now();
    
    const linkedinTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / linkedinDuration, 1);
      
      // Easing function for nice slowing down at the end
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeProgress * linkedinTarget);
      
      if (progress >= 1) {
        setLinkedinCounter(linkedinTarget);
        clearInterval(linkedinTimer);
      } else {
        setLinkedinCounter(currentVal);
      }
    }, 30);

    return () => {
      clearInterval(demoTimer);
      clearInterval(linkedinTimer);
    };
  }, [runCounters]);

  const resetSimulation = () => {
    setDemoCounter(0);
    setLinkedinCounter(0);
    setRunCounters(false);
    setTimeout(() => setRunCounters(true), 100);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Panel */}
      <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-amber-500 animate-pulse" />
            LinkedIn Incident Simulation Mode
          </h1>
          <p className="text-sm text-slate-400 mt-1 uppercase font-mono tracking-wider">
            Visualising the Enormous Scale of the 2021 Data Harvesting Event
          </p>
        </div>
        <button
          onClick={resetSimulation}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-mono"
        >
          <RefreshCw className="h-4 w-4" />
          Re-run Counters
        </button>
      </div>

      {/* Explainer Box */}
      <div className="bg-[#0d1321] border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 leading-relaxed text-slate-300">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          What was the LinkedIn 2021 Data Exposure?
        </h2>
        <p className="mb-4">
          In April 2021, an archive containing publicly scraped data from approximately **700 million LinkedIn profiles** was posted for sale on a hacker forum. This represented nearly **93% of LinkedIn&apos;s total user base** at the time.
        </p>
        <p>
          The perpetrator did not hack private database tables. Instead, they queried public profile pages and API endpoints systematically. Because the target servers lacked adequate rate limiting and query restrictions, the bot could crawl millions of profiles continuously without triggering blocks.
        </p>
      </div>

      {/* Chevron Flow Diagram */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 font-mono text-center">
        Data Collection Flow Chain
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center justify-center mb-12">
        <div className="bg-[#0c101d] border border-slate-800 p-4 rounded-xl text-center shadow-md">
          <Eye className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Public Profiles</h4>
          <p className="text-[10px] text-slate-500 mt-1 leading-normal">Profiles set to public viewing mode.</p>
        </div>
        
        <div className="hidden md:flex justify-center text-slate-600">
          <ArrowRight className="h-6 w-6 animate-pulse" />
        </div>

        <div className="bg-[#0c101d] border border-slate-800 p-4 rounded-xl text-center shadow-md">
          <Terminal className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Public API</h4>
          <p className="text-[10px] text-slate-500 mt-1 leading-normal">Endpoints exposing details to serve frontends.</p>
        </div>

        <div className="hidden md:flex justify-center text-slate-600">
          <ArrowRight className="h-6 w-6 animate-pulse" />
        </div>

        <div className="bg-[#0c101d] border border-slate-800 p-4 rounded-xl text-center shadow-md">
          <Layers className="h-6 w-6 text-amber-500 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Automated Requests</h4>
          <p className="text-[10px] text-slate-500 mt-1 leading-normal">Bots query profiles systematically at high speed.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-center mb-12">
        <div className="md:col-start-2 bg-[#0c101d] border border-slate-800 p-4 rounded-xl text-center shadow-md">
          <Database className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Aggregation</h4>
          <p className="text-[10px] text-slate-500 mt-1 leading-normal">Extracted files compiled and sold in dark forums.</p>
        </div>
      </div>

      {/* Numerical Comparison Grid */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 font-mono text-center">
        Data Scale Comparison
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Local Demo */}
        <div className="bg-[#0c101d] border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Our Simulated Sandbox</p>
          <div className="text-6xl font-black font-mono text-white tracking-tighter my-6">
            {demoCounter}
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase font-mono">
            Demo Profiles Crawled & Seeded
          </p>
          <p className="text-[11px] text-slate-500 mt-3 leading-normal max-w-xs mx-auto">
            A safe, self-contained system to visually demonstrating extraction techniques.
          </p>
        </div>

        {/* Real LinkedIn incident */}
        <div className="bg-[#0c101d] border border-red-950/40 rounded-2xl p-8 text-center shadow-xl relative overflow-hidden">
          {/* Accent border */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-red-600 animate-pulse" />
          
          <p className="text-xs font-bold uppercase tracking-widest text-red-400">LinkedIn 2021 Breach Archive</p>
          <div className="text-6xl font-black font-mono text-red-500 tracking-tighter my-6">
            {linkedinCounter.toLocaleString()}
          </div>
          <p className="text-xs font-semibold text-red-400 uppercase font-mono">
            Individual Profiles Exposed
          </p>
          <p className="text-[11px] text-slate-500 mt-3 leading-normal max-w-xs mx-auto">
            The actual volume extracted in the incident, creating a global security vulnerability.
          </p>
        </div>
      </div>
    </div>
  );
}

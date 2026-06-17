'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Code, Shield, HelpCircle, ArrowRight, MousePointer, Cpu } from 'lucide-react';

export default function CybersecurityEducation() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Panel */}
      <div className="mb-8 border-b border-slate-800 pb-6 text-center">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Cybersecurity Education Panel</h1>
        <p className="text-sm text-slate-400 mt-1 uppercase font-mono tracking-wider">
          Understanding the Mechanics and Prevention of Large-Scale Data Scraping
        </p>
      </div>

      {/* Main explanation paragraph */}
      <div className="bg-[#0d1321] border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 leading-relaxed text-slate-300">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-red-500" />
          What is Public API Data Scraping?
        </h2>
        <p className="mb-4">
          Data scraping occurs when automated scripts systematically extract information from a target site. In the case of public APIs, data scraping does not require breaking passwords or bypassing firewall systems. Instead, it exploits endpoints designed to serve profile information openly.
        </p>
        <p>
          In the **LinkedIn 2021 Incident**, over 700 million profiles were collected and aggregated by scraping publicly exposed query APIs. While no private credentials (passwords or billing info) were breached, the compilation of emails, phone numbers, and full resumes created massive datasets used for social engineering, spam, and identity theft.
        </p>
      </div>

      {/* Comparison Infographic */}
      <h3 className="text-base font-bold uppercase tracking-wider text-slate-400 mb-6 font-mono">
        Speed Comparison: Human Operator vs. Automated Bot
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Human card */}
        <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <MousePointer className="h-4.5 w-4.5 text-indigo-400" />
              Standard Human User
            </h4>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Clicks on profile link, waits for page files (JS/CSS/images) to render in browser, reads resume details, clicks back to search directory, selects next profile.
            </p>
          </div>

          {/* Animation panel */}
          <div className="my-6 bg-[#070b11] border border-slate-900 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[100px] overflow-hidden">
            <motion.div
              animate={{ 
                x: [-60, 60, -60], 
                y: [-10, 10, -10] 
              }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="text-[10px] font-mono text-indigo-400 flex items-center gap-2 bg-[#0c101d] px-3 py-1.5 rounded-lg border border-slate-800"
            >
              <MousePointer className="h-3.5 w-3.5" />
              Viewing profile details (15s)
            </motion.div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Average Rate:</span>
            <span className="text-indigo-400 font-bold">~4 Profiles / min</span>
          </div>
        </div>

        {/* Bot card */}
        <div className="bg-[#0c101d] border border-red-950/40 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          {/* Top glow */}
          <div className="absolute -right-20 -top-20 w-44 h-44 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-red-400 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-red-500" />
              Automated API Harvester (Python/Script)
            </h4>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Sends an initial JSON query to list all profile IDs, then spawns asynchronous requests to fetch 100 complete profile details concurrently in a single thread, bypassing UI rendering.
            </p>
          </div>

          {/* Animation panel */}
          <div className="my-6 bg-[#05070b] border border-slate-900 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[100px] overflow-hidden">
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <motion.div
                  key={idx}
                  animate={{ 
                    y: [-30, 30],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    delay: idx * 0.3,
                    ease: "linear"
                  }}
                  className="text-[9px] font-mono text-red-500 flex flex-col items-center"
                >
                  <Code className="h-4 w-4" />
                  <span>USER_{idx}</span>
                </motion.div>
              ))}
            </div>
            <div className="absolute text-[8px] font-mono text-red-500/30 bottom-1">
              GET /api/users/[ID] asynchronous threads
            </div>
          </div>

          <div className="bg-red-950/20 p-3 rounded-lg border border-red-900/20 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Average Rate:</span>
            <span className="text-red-400 font-bold">~4,000 Profiles / min</span>
          </div>
        </div>
      </div>

      {/* Cyberdefense mitigation controls */}
      <h3 className="text-base font-bold uppercase tracking-wider text-slate-400 mb-6 font-mono">
        Anti-Scraping Protection Controls
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-5 shadow-sm">
          <Shield className="h-6 w-6 text-emerald-500 mb-3" />
          <h4 className="text-sm font-bold text-white mb-2">1. Rate Limiting</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Restricts the number of API queries allowed from a single client IP address in a set time frame (e.g., blocking clients exceeding 10 requests per 10 seconds).
          </p>
        </div>

        <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-5 shadow-sm">
          <Shield className="h-6 w-6 text-emerald-500 mb-3" />
          <h4 className="text-sm font-bold text-white mb-2">2. Bot Signature Detection</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspects connection details such as the `User-Agent` header. Triggers blocks for scripts using automation libraries like Python Requests, HTTPX, or Puppeteer.
          </p>
        </div>

        <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-5 shadow-sm">
          <Shield className="h-6 w-6 text-emerald-500 mb-3" />
          <h4 className="text-sm font-bold text-white mb-2">3. Threshold Auditing</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Analyses access patterns using machine learning to flag accounts or IPs scraping data at superhuman speeds, triggering CAPTCHAs or permanent session blacklists.
          </p>
        </div>
      </div>
    </div>
  );
}

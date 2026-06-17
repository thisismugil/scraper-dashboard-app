'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, RotateCcw, AlertTriangle, ShieldCheck, ShieldAlert, Terminal as TermIcon, HardDrive, Wifi, Activity } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function ScraperConsole() {
  const [targetUrl, setTargetUrl] = useState('http://localhost:8000');
  const [protectionEnabled, setProtectionEnabled] = useState(false);
  const [isProtectionLoading, setIsProtectionLoading] = useState(false);
  
  // Scraping States
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'blocked' | 'stopped' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [collectedCount, setCollectedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(100);
  const [speed, setSpeed] = useState('');
  const [duration, setDuration] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Load target configuration and current protection state
  useEffect(() => {
    const savedTarget = localStorage.getItem('scrape_target_url') || 'http://localhost:8000';
    setTargetUrl(savedTarget);
    fetchProtectionStatus(savedTarget);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const fetchProtectionStatus = async (target: string) => {
    try {
      const res = await axios.get(`${target}/api/protection`);
      setProtectionEnabled(res.data.protection_enabled);
    } catch (e) {
      console.error('Could not fetch target protection status', e);
    }
  };

  const handleToggleProtection = async () => {
    setIsProtectionLoading(true);
    try {
      const target = localStorage.getItem('scrape_target_url') || 'http://localhost:8000';
      const newState = !protectionEnabled;
      const res = await axios.post(`${target}/api/protection`, { enabled: newState });
      setProtectionEnabled(res.data.protection_enabled);
      setLogs(prev => [
        ...prev, 
        `[SYSTEM] Target protection toggle received: ${res.data.protection_enabled ? 'ON (Rate Limiting & Bot Shield Active)' : 'OFF (Open Access)'}`
      ]);
    } catch (e) {
      setLogs(prev => [...prev, `[SYSTEM_ERROR] Failed to alter target protection state.`]);
    } finally {
      setIsProtectionLoading(false);
    }
  };

  const startScraping = () => {
    // Reset indicators
    setProgress(0);
    setCollectedCount(0);
    setSpeed('');
    setDuration('');
    setStatus('running');
    setLogs(['[SYSTEM] Initiating HTTP scraping stream to target API...', `[SYSTEM] Target URL: ${targetUrl}`]);
    
    // Close any previous stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sseUrl = `${API_URL}/api/scrape/start?target_url=${encodeURIComponent(targetUrl)}`;
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'log':
            setLogs(prev => [...prev, `[HARVEST] ${data.message}`]);
            break;
            
          case 'progress':
            setProgress(data.percent);
            setCollectedCount(data.collected);
            setTotalCount(data.total);
            setLogs(prev => [...prev, `[RETRIEVED] ${data.percent}% - Scraped profile data for '${data.current_user}'`]);
            break;
            
          case 'completed':
            setStatus('completed');
            setSpeed(data.speed);
            setDuration(data.timeTaken);
            setLogs(prev => [
              ...prev, 
              `[SUCCESS] Extraction completed. Collected: ${data.profilesCollected} | Speed: ${data.speed} | Time: ${data.timeTaken}`
            ]);
            eventSource.close();
            break;
            
          case 'blocked':
            setStatus('blocked');
            setLogs(prev => [
              ...prev,
              `[BLOCKED] CRITICAL SHIELD SHUTDOWN: ${data.reason}`,
              `[SECURITY] Scraping script failed due to security controls. HTTP Status: ${data.reason.includes('429') ? '429 Too Many Requests (Rate Limiter)' : '403 Forbidden (Bot Detection)'}`
            ]);
            eventSource.close();
            break;
            
          case 'stopped':
            setStatus('stopped');
            setLogs(prev => [...prev, `[STOPPED] Execution halted by operator.`]);
            eventSource.close();
            break;
            
          case 'error':
            setStatus('error');
            setLogs(prev => [...prev, `[ERROR] Stream failure: ${data.message}`]);
            eventSource.close();
            break;
        }
      } catch (err) {
        console.error('Error parsing SSE event data', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setStatus('error');
      setLogs(prev => [...prev, '[ERROR] Server connection lost or interrupted. Check backend console.']);
      eventSource.close();
    };
  };

  const stopScraping = async () => {
    try {
      await axios.post(`${API_URL}/api/scrape/stop`);
      setStatus('stopped');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetScraping = async () => {
    if (confirm('Are you sure you want to wipe collected local database records?')) {
      try {
        await axios.post(`${API_URL}/api/scrape/reset`);
        setStatus('idle');
        setProgress(0);
        setCollectedCount(0);
        setSpeed('');
        setDuration('');
        setLogs(['[SYSTEM] Scraper database and run logs reset successfully.']);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header with details */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Activity className="h-7 w-7 text-red-500" />
            Team 3 Scrapper Bot Console
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-wider">
            Connected Target: <span className="text-red-400">{targetUrl}</span>
          </p>
        </div>

        {/* Defense Mode Toggle */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {protectionEnabled ? (
              <div className="bg-emerald-950/40 text-emerald-500 border border-emerald-900/50 p-2 rounded-lg">
                <ShieldCheck className="h-6 w-6" />
              </div>
            ) : (
              <div className="bg-red-950/40 text-red-500 border border-red-900/50 p-2 rounded-lg">
                <ShieldAlert className="h-6 w-6 animate-pulse" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Target Protection Shield</p>
              <p className={`text-[10px] font-bold ${protectionEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
                {protectionEnabled ? 'ACTIVE (Rate Limit + Bot Detection)' : 'DISABLED (Open Target)'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleProtection}
            disabled={isProtectionLoading}
            className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
              protectionEnabled 
                ? 'bg-red-950 hover:bg-red-900/80 text-red-400 border border-red-900/40' 
                : 'bg-emerald-950 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-900/40'
            }`}
          >
            {isProtectionLoading ? 'Working...' : protectionEnabled ? 'Disable Protection' : 'Enable Protection'}
          </button>
        </div>
      </div>

      {/* Control Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profiles Collected</p>
          <p className="text-3xl font-extrabold text-white mt-1">
            {collectedCount} <span className="text-sm font-medium text-slate-500">/ {totalCount}</span>
          </p>
        </div>
        <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harvest Speed</p>
          <p className="text-3xl font-extrabold text-white mt-1">
            {speed || (status === 'running' ? 'Calculating...' : '0.0')} <span className="text-xs font-medium text-slate-500">{speed && 'p/s'}</span>
          </p>
        </div>
        <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Elapsed Duration</p>
          <p className="text-3xl font-extrabold text-white mt-1">
            {duration || (status === 'running' ? 'Running...' : '0.0s')}
          </p>
        </div>
        <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connection Link</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-mono font-bold text-emerald-400">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Console Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Scraper Engine Console (Terminal logs) */}
        <div className="lg:col-span-2 flex flex-col bg-[#0d1321] border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
          {/* Terminal Header */}
          <div className="bg-[#090d16] border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-400">
              <TermIcon className="h-4.5 w-4.5 text-red-500" />
              TERMINAL_SHELL: team3_scrapper_daemon.sh
            </div>
            
            {/* Control buttons */}
            <div className="flex gap-2">
              {status === 'running' ? (
                <button
                  onClick={stopScraping}
                  className="bg-red-950 border border-red-950 text-red-400 hover:bg-red-900/20 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold"
                >
                  <Square className="h-3.5 w-3.5" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={startScraping}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold shadow-md"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  Start
                </button>
              )}
              
              <button
                onClick={resetScraping}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border border-slate-800 cursor-pointer font-bold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Terminal Logs View */}
          <div className="flex-1 bg-[#05070b] p-6 font-mono text-[11px] leading-relaxed text-slate-300 overflow-y-auto max-h-[350px] min-h-[250px] flex flex-col gap-2">
            {logs.map((log, idx) => (
              <div 
                key={idx} 
                className={`${
                  log.includes('[ERROR]') || log.includes('[BLOCKED]') 
                    ? 'text-red-400 font-bold' 
                    : log.includes('[SYSTEM]') 
                    ? 'text-indigo-400' 
                    : log.includes('[SUCCESS]') || log.includes('[RETRIEVED]')
                    ? 'text-emerald-400' 
                    : 'text-slate-300'
                }`}
              >
                {log}
              </div>
            ))}
            {status === 'running' && (
              <div className="text-red-500 animate-pulse font-bold">
                &gt;_ SCRAPING_DAEMON_RUNNING (Awaiting responses...)
              </div>
            )}
            {logs.length === 0 && (
              <div className="text-slate-500 italic text-center my-auto">
                Operations console idle. Click &quot;Start&quot; above to initiate harvesting.
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Action / Progress Visualizer Panel */}
        <div className="bg-[#0d1321] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <HardDrive className="h-4.5 w-4.5 text-red-500" />
              Live Harvester Status
            </h3>

            {/* Progress Gauge */}
            <div className="my-8 text-center">
              <div className="relative inline-flex items-center justify-center">
                {/* Visual Circle Meter */}
                <div className="text-5xl font-black font-mono text-white tracking-tighter">
                  {progress}%
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-[#080b11] h-3 rounded-full mt-6 overflow-hidden border border-slate-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                  className={`h-full rounded-full transition-all ${status === 'blocked' ? 'bg-red-500' : 'bg-red-600'}`}
                />
              </div>
              
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                <span>0% START</span>
                <span>STATUS: {status.toUpperCase()}</span>
                <span>100% COMPLETE</span>
              </div>
            </div>
          </div>

          {/* Context Explainer Box */}
          <div className="bg-[#080b11] border border-slate-800/80 rounded-xl p-4 text-xs leading-relaxed text-slate-400">
            <h4 className="text-slate-200 font-bold mb-1">Defense Simulation Guide:</h4>
            <p className="mb-2">
              1. Run collection with **Protection OFF**. The script successfully harvests 100 profiles in seconds.
            </p>
            <p>
              2. Toggle **Protection ON**. Run collection again. The scraper script gets identified and blocked, failing instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

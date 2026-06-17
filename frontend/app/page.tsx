'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Link, Radio, AlertTriangle, Cpu, Database, ArrowRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function ScraperLanding() {
  const [targetUrl, setTargetUrl] = useState('http://localhost:8000');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [message, setMessage] = useState('');
  const [profilesCount, setProfilesCount] = useState(0);
  const router = useRouter();

  // Load target URL from localStorage if it exists
  useEffect(() => {
    const saved = localStorage.getItem('scrape_target_url');
    if (saved) {
      setTargetUrl(saved);
    }
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await axios.post(`${API_URL}/api/scrape/connect`, {
        target_url: targetUrl,
      });

      if (res.data.status === 'connected') {
        setStatus('success');
        setProfilesCount(res.data.profilesCount);
        setMessage('API accessibility verified. Secure connection established.');
        localStorage.setItem('scrape_target_url', targetUrl);
      } else {
        setStatus('failed');
        setMessage(res.data.message || 'API endpoint rejected connection.');
      }
    } catch (err: any) {
      setStatus('failed');
      setMessage(err.response?.data?.message || 'Host unreachable. Ensure the target directory server is running.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[80vh]">
      {/* Visual Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex p-3 rounded-full bg-red-950/30 border border-red-500/20 text-red-500 mb-4">
          <Cpu className="h-10 w-10 animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          CyberScrape Operations Center
        </h1>
        <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto uppercase tracking-widest font-semibold">
          LinkedIn Data Exposure Incident Simulation
        </p>
      </motion.div>

      {/* Connection Console */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-xl bg-[#0d1321] border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute -right-20 -top-20 w-44 h-44 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Radio className="h-5 w-5 text-red-500 animate-pulse" />
          Target API Connection Console
        </h2>

        <form onSubmit={handleConnect} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Target Site URL
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#080b11] border border-slate-800 rounded-xl outline-none focus:border-red-500 text-slate-200 text-sm font-mono"
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-500 leading-normal">
              Enter the base address of the simulated target directory app. (e.g., http://localhost:8000)
            </p>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {status === 'loading' ? 'Verifying Link...' : 'Establish Target Connection'}
          </button>
        </form>

        {/* Status Reporting */}
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-xl border text-xs leading-relaxed ${
              status === 'success'
                ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400'
                : status === 'failed'
                ? 'bg-red-950/20 border-red-900/50 text-red-400'
                : 'bg-slate-900/50 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex gap-3 items-start">
              {status === 'success' && <Database className="h-5 w-5 flex-shrink-0 text-emerald-500" />}
              {status === 'failed' && <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />}
              <div>
                <p className="font-bold">{status === 'success' ? 'CONNECTION SUCCESSFUL' : 'CONNECTION ERROR'}</p>
                <p className="mt-1 text-[11px] text-slate-400">{message}</p>
                {status === 'success' && (
                  <div className="mt-4 flex justify-between items-center bg-emerald-950/50 p-2.5 rounded border border-emerald-900/30">
                    <span>Identified Profiles Available: <strong>{profilesCount}</strong></span>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-all"
                    >
                      Enter Console
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

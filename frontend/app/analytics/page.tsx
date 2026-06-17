'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Database, History, TrendingUp, Compass, AlertOctagon } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6'];

interface AnalyticsData {
  totalCollected: number;
  runHistory: { time: string; collected: number; duration: number; speed: number }[];
  topLocations: { location: string; count: number }[];
  topCompanies: { company: string; count: number }[];
}

export default function ScraperAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/scrape/analytics`);
      setData(res.data);
    } catch (e) {
      console.error('Failed to fetch scraper analytics', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 bg-slate-800 w-1/4 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="h-28 bg-[#0d1321] border border-slate-800 rounded-xl animate-pulse" />
          <div className="h-28 bg-[#0d1321] border border-slate-800 rounded-xl animate-pulse" />
          <div className="h-28 bg-[#0d1321] border border-slate-800 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-[#0d1321] border border-slate-800 rounded-xl animate-pulse" />
          <div className="h-80 bg-[#0d1321] border border-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="bg-[#0d1321] border border-slate-800 p-8 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-red-500">Analytics Error</h2>
          <p className="text-sm text-slate-500 mt-2">Could not retrieve scraper session database logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Scraper Session Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated analytical insights derived from the harvested professional directory records.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          Refresh Charts
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Scraped Rows</p>
            <p className="text-3xl font-extrabold text-white mt-2">{data.totalCollected}</p>
          </div>
          <div className="bg-red-950/30 text-red-500 border border-red-900/40 p-3.5 rounded-xl">
            <Database className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historical Runs</p>
            <p className="text-3xl font-extrabold text-white mt-2">{data.runHistory.length}</p>
          </div>
          <div className="bg-indigo-950/30 text-indigo-500 border border-indigo-900/40 p-3.5 rounded-xl">
            <History className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Speed</p>
            <p className="text-xl font-bold text-white mt-3.5">
              {data.runHistory.length > 0 
                ? `${(data.runHistory.reduce((acc, curr) => acc + curr.speed, 0) / data.runHistory.length).toFixed(1)} profiles/sec` 
                : 'N/A'}
            </p>
          </div>
          <div className="bg-amber-950/30 text-amber-500 border border-amber-900/40 p-3.5 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Grid of charts */}
      {data.totalCollected === 0 ? (
        <div className="text-center py-20 bg-[#0d1321] border border-slate-800 rounded-2xl p-8">
          <AlertOctagon className="h-10 w-10 text-red-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-white">No Session Analytics Available</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
            Data visualizations require scraped records in the database. Open the Operations Console and start collection first.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Historical Runs Line chart */}
          <div className="bg-[#0d1321] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-red-500" />
              Scraping Execution & Speed Over Time
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.runHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#ef4444" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="speed" name="Speed (p/sec)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="collected" name="Profiles Collected" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Locations Pie Chart */}
            <div className="bg-[#0d1321] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                <Compass className="h-4.5 w-4.5 text-red-500" />
                Target Geography Density (Locations)
              </h3>
              <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-between">
                <div className="h-full w-full sm:w-2/3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.topLocations}
                        dataKey="count"
                        nameKey="location"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {data.topLocations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend */}
                <div className="w-full sm:w-1/3 flex flex-col gap-2 font-mono text-[10px] mt-4 sm:mt-0">
                  {data.topLocations.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span className="truncate">{item.location}</span>
                      </span>
                      <strong className="text-white font-bold">{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Companies Bar Chart */}
            <div className="bg-[#0d1321] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-red-500" />
                Target Corporate Density (Companies)
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topCompanies}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="company" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

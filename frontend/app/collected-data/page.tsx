'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, Download, RefreshCw, SlidersHorizontal, Trash2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface User {
  id: string;
  name: string;
  headline: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  experienceYears: number;
  skills: string[];
  profileImage: string;
  scrapedAt: string;
}

export default function CollectedDataList() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/scraped-users`, {
        params: {
          search: search || undefined,
          sort_by: sortBy,
          order,
          page,
          limit,
        },
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (e) {
      console.error('Failed to load scraped users', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy, order]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/scraped-users/export`);
      const data = res.data;
      if (data.length === 0) {
        alert('No data to export.');
        return;
      }
      
      const headers = ['id', 'name', 'headline', 'jobTitle', 'company', 'email', 'phone', 'location', 'education', 'experienceYears', 'skills'];
      let csvContent = headers.join(',') + '\n';
      
      data.forEach((row: any) => {
        const values = headers.map(header => {
          let val = row[header];
          if (Array.isArray(val)) {
            val = val.join(';');
          }
          const strVal = String(val || '').replace(/"/g, '""');
          return `"${strVal}"`;
        });
        csvContent += values.join(',') + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'scraped_professionals_database.csv');
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportJSON = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/scraped-users/export`);
      if (res.data.length === 0) {
        alert('No data to export.');
        return;
      }
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'scraped_professionals_database.json');
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAll = async () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to permanently delete all scraped profiles and runs? This action cannot be undone.');
      if (confirmed) {
        try {
          console.log('Sending reset request to:', `${API_URL}/api/scrape/reset`);
          const res = await axios.post(`${API_URL}/api/scrape/reset`);
          console.log('Reset response:', res.data);
          alert('All scraped data has been deleted successfully.');
          setPage(1);
          fetchUsers();
        } catch (e: any) {
          console.error('Failed to reset scraped data', e);
          alert('Failed to delete scraped data. Error: ' + (e?.message || String(e)));
        }
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Scraped Profile Database</h1>
          <p className="text-sm text-slate-400 mt-1">
            Displaying local database records captured during simulated automated crawling sessions.
          </p>
        </div>

        {/* Exports and Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 text-xs font-bold rounded-lg border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            CSV Export
          </button>
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-[#0c101d] hover:bg-[#11172a] text-red-400 hover:text-red-300 text-xs font-bold rounded-lg border border-red-950 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            JSON Export
          </button>
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-400 hover:text-red-300 text-xs font-bold rounded-lg border border-red-900/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete All Data
          </button>
        </div>
      </div>

      {/* Filter and Search form */}
      <div className="bg-[#0d1321] border border-slate-800 rounded-xl p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search database (Name, Company, Skills...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#080b11] border border-slate-800 rounded-lg outline-none focus:border-red-500 text-slate-200 text-xs font-medium placeholder-slate-500"
          />
        </form>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <button
            onClick={() => fetchUsers()}
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-white transition-all cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="h-4.5 w-4.5" />
            Reload Grid
          </button>
          <span>Total Database Rows: <strong className="text-white">{total}</strong></span>
        </div>
      </div>

      {/* Database Grid Table */}
      <div className="bg-[#0d1321] border border-slate-800 rounded-xl overflow-hidden shadow-xl mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#080b11] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('name')}>
                  Name {sortBy === 'name' && (order === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('jobTitle')}>
                  Job Title {sortBy === 'jobTitle' && (order === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('company')}>
                  Company {sortBy === 'company' && (order === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('location')}>
                  Location {sortBy === 'location' && (order === 'asc' ? '▲' : '▼')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-slate-800 rounded w-2/3" /></td>
                    <td className="p-4"><div className="h-4 bg-slate-800 rounded w-1/2" /></td>
                    <td className="p-4"><div className="h-4 bg-slate-800 rounded w-1/3" /></td>
                    <td className="p-4"><div className="h-4 bg-slate-800 rounded w-3/4" /></td>
                    <td className="p-4"><div className="h-4 bg-slate-800 rounded w-1/2" /></td>
                    <td className="p-4"><div className="h-4 bg-slate-800 rounded w-2/3" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                    The database is currently empty. Connect to the target and run collection first.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#111726]/30 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <img src={user.profileImage} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                      {user.name}
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{user.jobTitle}</td>
                    <td className="p-4 text-red-400 font-semibold">{user.company}</td>
                    <td className="p-4 font-mono text-slate-400 selection:bg-red-950">{user.email}</td>
                    <td className="p-4 font-mono text-slate-400">{user.phone}</td>
                    <td className="p-4 text-slate-300">{user.location}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="bg-[#080b11] border-t border-slate-800 px-5 py-4 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-white hover:bg-slate-850 disabled:text-slate-600 disabled:bg-transparent transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:text-white hover:bg-slate-850 disabled:text-slate-600 disabled:bg-transparent transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

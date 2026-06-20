'use client';
import React, { useState, useEffect } from 'react';
import { 
  Lock, Key, Plus, Trash2, Copy, Check, RefreshCw, AlertCircle, Calendar, Tag, ShieldCheck
} from 'lucide-react';

interface CodeDocument {
  _id: string;
  code: string;
  normalizedCode: string;
  isRedeemed: boolean;
  redeemedAt: string | null;
  createdAt: string;
  note: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);
  
  const [codes, setCodes] = useState<CodeDocument[]>([]);
  const [note, setNote] = useState<string>('');
  const [isGenLoading, setIsGenLoading] = useState<boolean>(false);
  const [isFetchLoading, setIsFetchLoading] = useState<boolean>(false);
  
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string>('');

  // Check if session already authenticated on load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cachedPass = sessionStorage.getItem('ats_admin_password');
    if (cachedPass) {
      setPassword(cachedPass);
      verifyLogin(cachedPass);
    }
  }, []);

  const verifyLogin = async (passToVerify: string) => {
    setIsLoginLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/codes', {
        headers: {
          'x-admin-password': passToVerify
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCodes(data.codes || []);
        setIsAuthenticated(true);
        sessionStorage.setItem('ats_admin_password', passToVerify);
      } else {
        setErrorMessage("Incorrect password. Please try again.");
        sessionStorage.removeItem('ats_admin_password');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error connecting to the server.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    verifyLogin(password.trim());
  };

  // Fetch codes list from database
  const fetchCodes = async () => {
    if (!password) return;
    setIsFetchLoading(true);
    try {
      const response = await fetch('/api/codes', {
        headers: { 'x-admin-password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setCodes(data.codes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchLoading(false);
    }
  };

  // Generate a code
  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({ note: note.trim() })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setCodes(prev => [data.code, ...prev]);
        setNote('');
      } else {
        setErrorMessage(data.error || "Failed to generate code.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error generating code.");
    } finally {
      setIsGenLoading(false);
    }
  };

  // Delete a code
  const handleDeleteCode = async (id: string, codeVal: string) => {
    if (!confirm(`Are you sure you want to delete code "${codeVal}"?`)) return;

    try {
      const response = await fetch(`/api/codes/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-password': password
        }
      });

      if (response.ok) {
        setCodes(prev => prev.filter(c => c._id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete code.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error deleting code.");
    }
  };

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    });
  };

  // Log Out action
  const handleLogout = () => {
    sessionStorage.removeItem('ats_admin_password');
    setIsAuthenticated(false);
    setPassword('');
    setCodes([]);
  };

  // Stats calculation
  const totalCodes = codes.length;
  const activeCodes = codes.filter(c => !c.isRedeemed).length;
  const usedCodes = codes.filter(c => c.isRedeemed).length;

  // ==================== RENDER 1: LOGIN FORM ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 overflow-hidden z-10 text-slate-100">
          <div className="text-center mb-6">
            <div className="bg-indigo-600/10 p-3 rounded-2xl text-indigo-400 inline-block mb-3 border border-indigo-500/20">
              <Lock size={28} />
            </div>
            <h2 className="text-lg font-black tracking-tight">Admin Control Panel</h2>
            <p className="text-xs text-slate-400 mt-1">Please enter your password to manage coupon codes</p>
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg mb-4 text-xs flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Enter Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-sm outline-none focus:border-indigo-500 text-slate-100 font-mono"
                  autoFocus
                />
                <div className="absolute right-3 top-2.5 text-slate-500">
                  <Key size={16} />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoginLoading || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 gap-1.5"
            >
              {isLoginLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Verify Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==================== RENDER 2: DASHBOARD PANEL ====================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight leading-none">Admin Control Panel</h2>
              <span className="text-[10px] text-slate-400 mt-1 inline-block">Manage your client subscription codes</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchCodes}
              disabled={isFetchLoading}
              className="p-2 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh database"
            >
              <RefreshCw size={14} className={isFetchLoading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 font-bold underline"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Stats Summary Widget */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
            <div className="text-xl font-black text-slate-200 leading-none">{totalCodes}</div>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-1.5">Total Codes</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
            <div className="text-xl font-black text-emerald-400 leading-none">{activeCodes}</div>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-1.5">Active (Unused)</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
            <div className="text-xl font-black text-slate-400 leading-none">{usedCodes}</div>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mt-1.5">Redeemed (Used)</span>
          </div>
        </div>

        {/* Action Panel & Code Generator */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 items-stretch">
          {/* Create Code Form */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <Tag size={15} className="text-indigo-400" />
                Generate New Code
              </h3>
              <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                Create a single-use code to sell to your clients. Once generated, they can enter it on the website to unlock their downloads.
              </p>
            </div>

            <form onSubmit={handleGenerateCode} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Client Note / Name</label>
                <input 
                  type="text" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. John Doe - paid WhatsApp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 text-slate-100"
                />
              </div>

              <button 
                type="submit"
                disabled={isGenLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 gap-1.5"
              >
                {isGenLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Create Unlock Code</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Codes List Table */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5">
              <Calendar size={15} className="text-indigo-400" />
              Codes Directory
            </h3>

            {codes.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs py-10">
                No generated codes found. Generate one on the left to start!
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-[11px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-2">Code (Click to copy)</th>
                      <th className="py-2.5 px-2">Note</th>
                      <th className="py-2.5 px-2">Status</th>
                      <th className="py-2.5 px-2">Redeemed At</th>
                      <th className="py-2.5 px-2 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((item) => (
                      <tr key={item._id} className="border-b border-slate-850 hover:bg-slate-850/20 text-slate-300">
                        <td className="py-2 px-2 font-mono">
                          <button 
                            onClick={() => handleCopyCode(item.code, item._id)}
                            className="flex items-center gap-1.5 hover:text-white"
                          >
                            <span className={item.isRedeemed ? 'text-slate-500 line-through' : 'text-indigo-400 font-bold'}>
                              {item.code}
                            </span>
                            {copiedId === item._id ? (
                              <Check size={11} className="text-emerald-400" />
                            ) : (
                              <Copy size={11} className="text-slate-600 hover:text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-2 max-w-[120px] truncate text-slate-400" title={item.note}>
                          {item.note || <span className="italic text-slate-600">none</span>}
                        </td>
                        <td className="py-2 px-2">
                          <span className={`px-1.5 py-0.5 rounded font-semibold text-[9px] uppercase tracking-wide ${
                            item.isRedeemed 
                              ? 'bg-slate-800 text-slate-500' 
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {item.isRedeemed ? 'Used' : 'Active'}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-slate-500">
                          {item.isRedeemed && item.redeemedAt 
                            ? new Date(item.redeemedAt).toLocaleDateString()
                            : <span className="italic text-slate-600">-</span>
                          }
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button 
                            onClick={() => handleDeleteCode(item._id, item.code)}
                            className="p-1 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

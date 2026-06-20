'use client';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleEditor, togglePreview, toggleScorer, toggleSettings } from '@/store/uiSlice';
import { addResume, setActiveResumeId, deleteResume, renameResume, cloneResume } from '@/store/resumeSlice';
import Link from 'next/link';
import { 
  FileText, Plus, Edit2, Copy, Trash2, 
  Settings, Eye, Award, Lock, Unlock, EyeOff, LayoutGrid, Sliders
} from 'lucide-react';

interface NavbarProps {
  onOpenPaymentModal: () => void;
}

export default function Navbar({ onOpenPaymentModal }: NavbarProps) {
  const dispatch = useAppDispatch();
  
  // Select store states
  const { showEditor, showPreview, showScorer, showSettings } = useAppSelector(state => state.ui);
  const { resumes, activeResumeId } = useAppSelector(state => state.resume);
  const isUnlocked = useAppSelector(state => state.payment.isUnlocked);
  
  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  const handleCreateResume = () => {
    const name = prompt("Enter a name for the new resume profile:", "My New Resume");
    if (name && name.trim()) {
      dispatch(addResume(name.trim()));
    }
  };

  const handleRenameResume = () => {
    if (!activeResume) return;
    const name = prompt("Enter a new name for this resume:", activeResume.name);
    if (name && name.trim()) {
      dispatch(renameResume({ id: activeResume.id, name: name.trim() }));
    }
  };

  const handleCloneResume = () => {
    if (!activeResume) return;
    dispatch(cloneResume(activeResume.id));
  };

  const handleDeleteResume = () => {
    if (!activeResume) return;
    if (resumes.length <= 1) {
      alert("You must keep at least one resume profile.");
      return;
    }
    if (confirm(`Are you sure you want to delete "${activeResume.name}"?`)) {
      dispatch(deleteResume(activeResume.id));
    }
  };

  return (
    <header className="no-print bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
          <FileText size={20} />
        </div>
        <span className="font-extrabold text-lg tracking-tight">
          ATS Resume <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Studio</span>
        </span>
      </div>

      {/* View Toggle Controls (Center) */}
      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80">
        <button 
          onClick={() => dispatch(toggleEditor())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showEditor 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle CV Writing Form"
        >
          <FileText size={14} />
          <span className="hidden sm:inline">Write CV</span>
        </button>

        <button 
          onClick={() => dispatch(togglePreview())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showPreview 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle A4 Preview Sheet"
        >
          {showPreview ? <Eye size={14} /> : <EyeOff size={14} />}
          <span className="hidden sm:inline">Live Preview</span>
        </button>

        <button 
          onClick={() => dispatch(toggleScorer())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showScorer 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle ATS & Enhancv Grader"
        >
          <Award size={14} />
          <span className="hidden sm:inline">ATS Scorer</span>
        </button>

        <button 
          onClick={() => dispatch(toggleSettings())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showSettings 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Design Customizer"
        >
          <Sliders size={14} />
          <span className="hidden sm:inline">Design Options</span>
        </button>
      </div>

      {/* Resume Switcher & Action buttons */}
      <div className="flex items-center gap-3">
        {/* Selector */}
        {activeResume && (
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <select 
              value={activeResumeId}
              onChange={(e) => dispatch(setActiveResumeId(e.target.value))}
              className="bg-transparent text-xs font-semibold text-slate-200 outline-none px-2 py-1 pr-6 cursor-pointer"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-100">
                  {r.name.length > 25 ? r.name.substring(0, 22) + '...' : r.name}
                </option>
              ))}
            </select>

            <button 
              onClick={handleCreateResume}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-indigo-400 transition-colors"
              title="Create New Resume Profile"
            >
              <Plus size={14} />
            </button>

            <button 
              onClick={handleRenameResume}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Rename Current Resume"
            >
              <Edit2 size={13} />
            </button>

            <button 
              onClick={handleCloneResume}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
              title="Clone Current Resume"
            >
              <Copy size={13} />
            </button>

            <button 
              onClick={handleDeleteResume}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-red-400 transition-colors"
              title="Delete Current Resume"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}

        {/* Lock/Unlock Paywall button */}
        <button
          onClick={onOpenPaymentModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isUnlocked 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10'
          }`}
        >
          {isUnlocked ? (
            <>
              <Unlock size={13} />
              <span>Unlocked</span>
            </>
          ) : (
            <>
              <Lock size={13} />
              <span>Unlock / Redeem</span>
            </>
          )}
        </button>

        {/* Admin Link */}
        <Link 
          href="/admin" 
          target="_blank"
          className="text-xs text-slate-400 hover:text-slate-200 underline font-semibold"
          title="Go to private code generator dashboard"
        >
          Control Panel
        </Link>
      </div>
    </header>
  );
}

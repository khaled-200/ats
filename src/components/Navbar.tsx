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

        {/* Support Button */}
        <a
          href="https://wa.me/963957277945?text=Hello%2C%20I%27m%20using%20the%20ATS%20Resume%20Studio%20and%20need%20support."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 transition-all"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.09-1.1l-.29-.17-3.05.8.82-2.97-.19-.3A8.176 8.176 0 0 1 3.73 11.9c0-4.53 3.7-8.23 8.24-8.23m-3.61 4.88c-.2-.45-.41-.46-.6-.47-.15-.01-.33-.01-.51-.01-.18 0-.47.07-.72.34-.25.27-.96.94-.96 2.29s.98 2.64 1.12 2.82c.14.19 1.93 2.94 4.67 4.13.65.28 1.16.45 1.55.57.65.21 1.25.18 1.72.11.53-.08 1.62-.66 1.85-1.3.23-.64.23-1.18.16-1.3-.07-.11-.25-.18-.53-.32-.28-.14-1.65-.81-1.91-.9-.25-.09-.44-.14-.62.14-.18.27-.7 0-.86-.18s-.32-.36-.6-.86c-.28-.5-.28-.9-.14-1.18.14-.28.28-.41.42-.56.14-.15.19-.25.28-.41.09-.16.05-.31-.02-.45-.07-.14-.6-1.45-.83-1.97Z" />
          </svg>
          <span>Support</span>
        </a>
      </div>
    </header>
  );
}

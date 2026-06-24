'use client';
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateResumeMeta, loadSampleData, clearActiveData, Resume } from '@/store/resumeSlice';
import Navbar from '@/components/Navbar';
import EditorAccordion from '@/components/EditorAccordion';
import ResumeSheet from '@/components/ResumeSheet';
import AtsScorer from '@/components/AtsScorer';
import PaymentModal from '@/components/PaymentModal';
import { exportToWord, exportToPlainText } from '@/lib/exportUtils';
import { FileDown, Download, Lock, CheckCircle, RotateCcw, Play } from 'lucide-react';

export default function WorkspacePage() {
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  
  // Intro & Splash Screen states
  const [showIntro, setShowIntro] = useState(true);
  const [introFade, setIntroFade] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashFade, setSplashFade] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sync client-side mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Timers for the Welcome screen (start only after the Intro is dismissed)
  useEffect(() => {
    if (showIntro || !showSplash) return;

    // Animate progress bar filling up
    const progressTimer = setTimeout(() => {
      setProgress(100);
    }, 100);

    // Start fading out the splash screen
    const fadeTimer = setTimeout(() => {
      setSplashFade(true);
    }, 2500);

    // Completely unmount the splash screen
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [showIntro, showSplash]);

  const handleStartWorkspace = () => {
    setIntroFade(true);
    setTimeout(() => {
      setShowIntro(false);
      setShowSplash(true);
    }, 500);
  };

  const handleSkipSplash = () => {
    setProgress(100);
    setSplashFade(true);
    setTimeout(() => {
      setShowSplash(false);
    }, 500);
  };

  // Select store states
  const { showEditor, showPreview, showScorer, showSettings } = useAppSelector(state => state.ui);
  const { resumes, activeResumeId } = useAppSelector(state => state.resume);
  const isUnlocked = useAppSelector(state => state.payment.isUnlocked);

  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Loading ATS Resume Studio Workspace...
      </div>
    );
  }

  // Paywall checks for file downloads
  const handleExportAction = (format: 'pdf' | 'word' | 'txt') => {
    if (!isUnlocked) {
      setIsPaymentOpen(true);
      return;
    }

    if (format === 'pdf') {
      window.print();
    } else if (format === 'word') {
      const sheet = document.getElementById("resumePreviewSheet");
      if (sheet && activeResume) {
        exportToWord(activeResume, sheet.innerHTML);
      }
    } else if (format === 'txt') {
      if (activeResume) {
        exportToPlainText(activeResume);
      }
    }
  };

  const handleLoadSample = () => {
    if (confirm("Replace active CV details with sample data?")) {
      dispatch(loadSampleData());
    }
  };

  const handleResetData = () => {
    if (confirm("Clear all text fields on this CV? This cannot be undone.")) {
      dispatch(clearActiveData());
    }
  };

  return (
    <>
      {/* Intro Screen */}
      {showIntro && (
        <div 
          className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950 p-6 text-center select-none transition-all duration-500 ease-out ${
            introFade ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          {/* Glowing Ambient Background Orb */}
          <div className="absolute w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[90px] animate-pulse" />
          <div className="absolute w-[250px] h-[250px] bg-purple-500/5 rounded-full blur-[80px] delay-700 animate-pulse" />

          {/* Intro Content */}
          <div className="relative flex flex-col items-center justify-center max-w-3xl">
            {/* Elegant Icon */}
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-500/10 mb-8 scale-90 animate-pulse">
              <FileDown size={40} />
            </div>

            {/* Arabic Main Phrase */}
            <h2 className="text-xl md:text-2xl font-black text-slate-100 leading-relaxed mb-4 text-center max-w-2xl" dir="rtl">
              استمتع بتجربة مجانية واصنع سيرتك الذاتيّة الخاصة بك وفقاً للنظام العالمي الحديث والمزوّد بالذكاء الاصطناعي
            </h2>

            {/* English Small Translation */}
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-10 max-w-xl">
              Enjoy a free experience and make your CV to the modern global system and artificial intelligence
            </p>

            {/* Skip/Continue Action Button */}
            <button
              onClick={handleStartWorkspace}
              className="relative group overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-8 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>ابدأ الآن / Start Now</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Splash Screen */}
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 select-none transition-all duration-500 ease-out ${
            splashFade ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          {/* Glowing Ambient Background Orb */}
          <div className="absolute w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[90px] animate-pulse" />
          <div className="absolute w-[250px] h-[250px] bg-purple-500/5 rounded-full blur-[80px] delay-700 animate-pulse" />

          {/* Splash Content */}
          <div className="relative flex flex-col items-center justify-center text-center px-6">
            {/* Elegant Animated Logo Icon */}
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-500/10 mb-6 scale-90 animate-bounce duration-1000">
              <FileDown size={40} className="animate-pulse" />
            </div>

            {/* Glowing Text heading */}
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent drop-shadow-sm">
              Welcome to your Smart ATS
            </h1>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-[0.25em] mt-2">
              Optimizing your career path
            </p>

            {/* Sleek Progress Loader */}
            <div className="w-56 h-1 bg-slate-900 rounded-full overflow-hidden mt-8 border border-slate-800/40 relative">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-[2400ms] ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Skipping Option */}
            <button
              onClick={handleSkipSplash}
              className={`mt-6 px-4 py-1.5 rounded-full border border-slate-850 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 backdrop-blur-sm active:scale-95 transition-opacity duration-300 ${
                splashFade ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              Skip / تخطي
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div 
        className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col transition-all duration-700 ease-out ${
          !splashFade ? 'opacity-0 scale-95 filter blur-md' : 'opacity-100 scale-100 filter blur-none'
        }`}
      >
        {/* Navigation bar */}
        <Navbar onOpenPaymentModal={() => setIsPaymentOpen(true)} />

        {/* Main Layout Grid */}
        <div className="flex-1 flex flex-col md:flex-row relative">
          
          {/* ==================== LEFT DRAWER: DESIGN OPTIONS ==================== */}
          {showSettings && activeResume && (
            <aside className="no-print w-full md:w-64 shrink-0 bg-slate-900 border-r border-slate-800 p-4 space-y-4 animation-fade-in z-20">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Design Customizer</h3>
              
              {/* Template Selector */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Layout Template</label>
                <select 
                  value={activeResume.template}
                  onChange={(e) => dispatch(updateResumeMeta({ template: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer outline-none"
                >
                  <option value="template-classic">Classic Professional</option>
                  <option value="template-modern">Modern Corporate</option>
                  <option value="template-minimal">Minimalist Elite</option>
                  <option value="template-tech">Technical Developer</option>
                  <option value="template-skills">Skills First (Career Changer)</option>
                  <option value="template-executive">Executive Leader</option>
                  <option value="template-ivyleague">Ivy League Centered</option>
                </select>
              </div>

              {/* Font Family */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Font Style (ATS Safe)</label>
                <select 
                  value={activeResume.font}
                  onChange={(e) => dispatch(updateResumeMeta({ font: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer outline-none"
                >
                  <option value="Arial, sans-serif">Arial (Sans-Serif)</option>
                  <option value="Calibri, Arial, sans-serif">Calibri (Sans-Serif)</option>
                  <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica (Sans-Serif)</option>
                  <option value="Georgia, serif">Georgia (Serif)</option>
                  <option value="'Times New Roman', Times, serif">Times New Roman (Serif)</option>
                  <option value="'Garamond', serif">Garamond (Serif)</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Font Size</label>
                <select 
                  value={activeResume.fontSize}
                  onChange={(e) => dispatch(updateResumeMeta({ fontSize: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer outline-none"
                >
                  <option value="10pt">10pt (Compact)</option>
                  <option value="11pt">11pt (Recommended)</option>
                  <option value="12pt">12pt (Readable)</option>
                </select>
              </div>

              {/* Color Accent Theme */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Accent Colors</label>
                <select 
                  value={activeResume.themeColor}
                  onChange={(e) => dispatch(updateResumeMeta({ themeColor: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer outline-none"
                >
                  <option value="theme-navy">Navy Blue</option>
                  <option value="theme-dark">Charcoal Black</option>
                  <option value="theme-slate">Slate Gray</option>
                  <option value="theme-emerald">Deep Emerald</option>
                  <option value="theme-burgundy">Burgundy Red</option>
                </select>
              </div>

              {/* Language Selector */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Document Direction</label>
                <select 
                  value={activeResume.language}
                  onChange={(e) => dispatch(updateResumeMeta({ language: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer outline-none"
                >
                  <option value="en">English (LTR)</option>
                  <option value="ar">العربية (RTL)</option>
                </select>
              </div>

              {/* Quick Actions inside sidebar */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button 
                  onClick={handleLoadSample}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 text-slate-300 text-xs font-semibold transition-all"
                >
                  <Play size={12} />
                  Load Sample
                </button>
                <button 
                  onClick={handleResetData}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-800 hover:bg-red-950/20 text-red-400 hover:text-red-300 text-xs font-semibold transition-all"
                >
                  <RotateCcw size={12} />
                  Reset CV Fields
                </button>
              </div>
            </aside>
          )}

          {/* ==================== WORKSPACE GRID PANELS ==================== */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 p-4 items-stretch">
            
            {/* Main workspace (Writing & Sheet) */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 items-stretch min-w-0">
              {/* Form writing editor (Left Panel) */}
              {showEditor && (
                <div className="no-print flex-1 bg-slate-950 min-w-0 overflow-y-auto max-h-[85vh] pr-1">
                  <EditorAccordion />
                </div>
              )}

              {/* Live A4 sheet Preview (Center Panel) */}
              {showPreview && (
                <div className="flex-[1.25] bg-slate-900/40 rounded-2xl border border-slate-850 p-4 flex flex-col items-center min-w-0 overflow-y-auto max-h-[85vh]">
                  {/* Floating file exports bar */}
                  <div className="no-print bg-slate-950/90 backdrop-blur border border-slate-850 px-4 py-2.5 rounded-2xl w-full max-w-[210mm] mb-4 flex items-center justify-between shadow-lg">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Document Export Studio</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleExportAction('pdf')}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                          isUnlocked 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isUnlocked ? <Download size={11} /> : <Lock size={11} />}
                        <span>Export PDF</span>
                      </button>
                      <button 
                        onClick={() => handleExportAction('word')}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 transition-all"
                      >
                        {!isUnlocked && <Lock size={11} />}
                        <span>Export Word</span>
                      </button>
                      <button 
                        onClick={() => handleExportAction('txt')}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 transition-all"
                      >
                        {!isUnlocked && <Lock size={11} />}
                        <span>Export TXT</span>
                      </button>
                    </div>
                  </div>

                  {/* PDF sheet component wrapper */}
                  <div className="w-full flex-1">
                    <ResumeSheet />
                  </div>
                </div>
              )}
            </div>

            {/* Grader Auditor widgets (Right Panel) */}
            {showScorer && (
              <div className="no-print w-full xl:w-[320px] shrink-0 overflow-y-auto max-h-[85vh] xl:pl-1">
                <AtsScorer />
              </div>
            )}

          </div>
        </div>

        {/* Pop-up Checkout Modal */}
        <PaymentModal 
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
        />
      </div>
    </>
  );
}

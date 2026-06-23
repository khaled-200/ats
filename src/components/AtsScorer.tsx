'use client';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateResumeData } from '@/store/resumeSlice';
import { 
  ACTION_VERBS, CLICHE_BUZZWORDS, GRAMMAR_DICT, RESUME_DICT
} from '@/lib/dictionaries';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Search, ExternalLink } from 'lucide-react';

interface ProofIssue {
  type: 'spacing' | 'capitalization' | 'typo' | 'passive';
  desc: string;
  fixable: boolean;
}

export default function AtsScorer() {
  const dispatch = useAppDispatch();
  const { resumes, activeResumeId } = useAppSelector(state => state.resume);
  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  const [activeTab, setActiveTab] = useState<'ats' | 'enhancv' | 'proof'>('ats');
  const [dictQuery, setDictQuery] = useState<string>('');
  const [dictResult, setDictResult] = useState<React.ReactNode>('Type a word above to see offline translations.');

  if (!activeResume) return null;

  const { data } = activeResume;
  const isRtl = activeResume.language === 'ar';

  // ==========================================
  // 1. ATS COMPLIANCE AUDITOR LOGIC
  // ==========================================
  const runAtsAudit = () => {
    const checks = [
      {
        id: "name_title",
        desc: "Includes Full Name and Target Job Title",
        audit: () => (data.personal.fullName && data.personal.fullName.trim().length > 2) && 
                     (data.personal.jobTitle && data.personal.jobTitle.trim().length > 2),
        weight: 15,
        failMsg: "Make sure you include your Full Name and a clear Job Title."
      },
      {
        id: "contact_info",
        desc: "Complete contact details (Email, Phone/Location)",
        audit: () => (data.personal.email && data.personal.email.includes("@")) && 
                     (data.personal.phone || data.personal.location),
        weight: 15,
        failMsg: "Ensure you provide a valid Email and at least a Phone number or City location."
      },
      {
        id: "photo_chk",
        desc: "ATS Compliance Photo Check",
        audit: () => !data.personal.photo, 
        weight: 10,
        failMsg: "Warning: Strict ATS systems recommend removing photos to comply with anti-bias regulations."
      },
      {
        id: "summary_chk",
        desc: "Professional Summary present and of recommended length",
        audit: () => {
          const text = data.summary || "";
          return text.trim().length >= 120 && text.trim().length <= 500;
        },
        weight: 15,
        failMsg: "Your summary should be between 120 and 500 characters."
      },
      {
        id: "exp_chk",
        desc: "Has Work Experience entries with description points",
        audit: () => {
          if (!data.experience || data.experience.length === 0) return false;
          return data.experience.every(exp => exp.title && exp.company && exp.description && exp.description.trim().length > 20);
        },
        weight: 25,
        failMsg: "Define your previous jobs with bullet points explaining your achievements."
      },
      {
        id: "skills_chk",
        desc: "Core Skills section lists at least 5 keywords",
        audit: () => {
          if (!data.skills || data.skills.length === 0) return false;
          const totalSkills = data.skills.reduce((acc, cat) => acc + (cat.list ? cat.list.split(",").length : 0), 0);
          return totalSkills >= 5;
        },
        weight: 20,
        failMsg: "Provide at least 5 skills split by commas."
      }
    ];

    let totalScore = 0;
    let passedCount = 0;
    const results = checks.map(check => {
      const passed = check.audit();
      if (passed) {
        totalScore += check.weight;
        passedCount++;
      }
      return { ...check, passed };
    });

    return { totalScore, passedCount, results };
  };

  const { totalScore, passedCount, results: atsResults } = runAtsAudit();

  // ==========================================
  // 2. ENHANCV STRENGTH CHECKER LOGIC
  // ==========================================
  const runEnhancvAudit = () => {
    let allText = "";
    if (data.summary) allText += " " + data.summary;
    if (data.experience) {
      data.experience.forEach(exp => allText += " " + exp.description + " " + exp.title);
    }
    if (data.projects) {
      data.projects.forEach(proj => allText += " " + proj.description + " " + proj.title);
    }
    const textLower = allText.toLowerCase();

    // Metric check
    const numbersFound = textLower.match(/\b\d+%?\b/g) || [];
    const metricsCount = numbersFound.length;
    let metricScore = 0;
    let metricFeedback = "";
    if (metricsCount >= 3) {
      metricScore = 35;
      metricFeedback = `Excellent! Found ${metricsCount} metrics (e.g. ${numbersFound.slice(0, 3).join(", ")}). Your CV is highly quantifiable.`;
    } else if (metricsCount > 0) {
      metricScore = 20;
      metricFeedback = `Good, but could be stronger. Found ${metricsCount} metrics. Try adding numbers to experience bullet points (budgets, %, team sizes).`;
    } else {
      metricScore = 0;
      metricFeedback = `Weak. No quantifiable numbers found. Enhancv audits require metrics to prove accomplishments.`;
    }

    // Action Verbs check
    let verbsFound: string[] = [];
    ACTION_VERBS.forEach(verb => {
      const regex = new RegExp(`\\b${verb}\\b`, "i");
      if (regex.test(textLower)) verbsFound.push(verb);
    });
    let verbScore = 0;
    let verbFeedback = "";
    if (verbsFound.length >= 4) {
      verbScore = 35;
      verbFeedback = `Great phrasing! Found strong verbs: ${verbsFound.slice(0, 4).join(", ")}.`;
    } else if (verbsFound.length > 0) {
      verbScore = 15;
      verbFeedback = `Add more action. Found verbs: ${verbsFound.join(", ")}. Replace phrases like 'responsible for' with verbs like 'Led', 'Managed'.`;
    } else {
      verbScore = 0;
      verbFeedback = `Weak phrasing. No action verbs detected. Start each work experience bullet point with an active verb.`;
    }

    // Clichés check
    let clichésFound: string[] = [];
    CLICHE_BUZZWORDS.forEach(word => {
      const regex = new RegExp(`\\b${word.replace(/-/g, '\\-')}\\b`, "i");
      if (regex.test(textLower)) clichésFound.push(word);
    });
    let buzzwordScore = 30;
    let buzzwordFeedback = "";
    if (clichésFound.length === 0) {
      buzzwordFeedback = `Nice job! No cliché buzzwords detected. Your language is professional and direct.`;
    } else {
      buzzwordScore = Math.max(0, 30 - (clichésFound.length * 10));
      buzzwordFeedback = `Flagged ${clichésFound.length} clichés: "${clichésFound.join('", "')}". Replace them with active achievements.`;
    }

    const enhancvScore = metricScore + verbScore + buzzwordScore;
    return {
      enhancvScore,
      metricScore,
      metricFeedback,
      verbScore,
      verbFeedback,
      buzzwordScore,
      buzzwordFeedback
    };
  };

  const {
    enhancvScore, metricScore, metricFeedback, verbScore, verbFeedback, buzzwordScore, buzzwordFeedback
  } = runEnhancvAudit();

  // ==========================================
  // 3. OFFLINE PROOFREADER LOGIC
  // ==========================================
  const [onlineIssues, setOnlineIssues] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const runOnlineProofread = async () => {
    setIsChecking(true);
    try {
      const fields = [
        { id: 'summary', label: isRtl ? 'الملخص المهني' : 'Professional Summary', text: data.summary || '', update: (val: string, d: any) => { d.summary = val; } },
        ...(data.experience || []).map((exp, idx) => ({
          id: `experience_${idx}_description`,
          label: isRtl ? `وصف الخبرة #${idx + 1}` : `Experience #${idx + 1} Description`,
          text: exp.description || '',
          update: (val: string, d: any) => { d.experience[idx].description = val; }
        })),
        ...(data.experience || []).map((exp, idx) => ({
          id: `experience_${idx}_title`,
          label: isRtl ? `مسمى الخبرة #${idx + 1}` : `Experience #${idx + 1} Title`,
          text: exp.title || '',
          update: (val: string, d: any) => { d.experience[idx].title = val; }
        })),
        ...(data.projects || []).map((proj, idx) => ({
          id: `projects_${idx}_description`,
          label: isRtl ? `وصف المشروع #${idx + 1}` : `Project #${idx + 1} Description`,
          text: proj.description || '',
          update: (val: string, d: any) => { d.projects[idx].description = val; }
        })),
        ...(data.projects || []).map((proj, idx) => ({
          id: `projects_${idx}_title`,
          label: isRtl ? `عنوان المشروع #${idx + 1}` : `Project #${idx + 1} Title`,
          text: proj.title || '',
          update: (val: string, d: any) => { d.projects[idx].title = val; }
        }))
      ].filter(f => f.text.trim().length > 0);

      if (fields.length === 0) {
        setOnlineIssues([]);
        setHasChecked(true);
        setIsChecking(false);
        return;
      }

      // Combine text and compute ranges
      let combinedText = "";
      const fieldRanges: { id: string; label: string; start: number; end: number; originalText: string }[] = [];

      fields.forEach(f => {
        const start = combinedText.length;
        combinedText += f.text + "\n\n";
        const end = combinedText.length;
        fieldRanges.push({ id: f.id, label: f.label, start, end, originalText: f.text });
      });

      const langCode = activeResume.language === 'ar' ? 'ar' : 'en-US';

      // Call LanguageTool API
      const params = new URLSearchParams();
      params.append("text", combinedText);
      params.append("language", langCode);

      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        body: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const result = await res.json();
      
      // Map matches back to fields
      const issues = (result.matches || []).map((match: any) => {
        const field = fieldRanges.find(f => match.offset >= f.start && match.offset < f.end);
        if (!field) return null;

        const relOffset = match.offset - field.start;
        const typoText = field.originalText.substring(relOffset, relOffset + match.length);

        return {
          fieldLabel: field.label,
          fieldId: field.id,
          message: match.message,
          typo: typoText,
          suggestions: (match.replacements || []).slice(0, 3).map((r: any) => r.value),
          offset: match.offset,
          length: match.length
        };
      }).filter(Boolean);

      setOnlineIssues(issues);
      setHasChecked(true);
    } catch (err) {
      console.error(err);
      alert(isRtl ? "فشل الاتصال بمدقق القواعد عبر الإنترنت. يرجى التحقق من اتصال الشبكة الخاص بك." : "Failed to connect to the online proofreader. Please check your network connection.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleOnlineAutoFix = () => {
    if (onlineIssues.length === 0) return;

    const fixedData = JSON.parse(JSON.stringify(data));
    
    const fields = [
      { id: 'summary', text: fixedData.summary || '', update: (val: string) => { fixedData.summary = val; } },
      ...(fixedData.experience || []).map((exp: any, idx: number) => ({
        id: `experience_${idx}_description`,
        text: exp.description || '',
        update: (val: string) => { fixedData.experience[idx].description = val; }
      })),
      ...(fixedData.experience || []).map((exp: any, idx: number) => ({
        id: `experience_${idx}_title`,
        text: exp.title || '',
        update: (val: string) => { fixedData.experience[idx].title = val; }
      })),
      ...(fixedData.projects || []).map((proj: any, idx: number) => ({
        id: `projects_${idx}_description`,
        text: proj.description || '',
        update: (val: string) => { fixedData.projects[idx].description = val; }
      })),
      ...(fixedData.projects || []).map((proj: any, idx: number) => ({
        id: `projects_${idx}_title`,
        text: proj.title || '',
        update: (val: string) => { fixedData.projects[idx].title = val; }
      }))
    ].filter(f => f.text.trim().length > 0);

    let combinedText = "";
    const fieldRanges: { id: string; start: number; end: number; text: string; update: (val: string) => void }[] = [];

    fields.forEach(f => {
      const start = combinedText.length;
      combinedText += f.text + "\n\n";
      const end = combinedText.length;
      fieldRanges.push({ id: f.id, start, end, text: f.text, update: f.update });
    });

    const sortedIssues = [...onlineIssues].sort((a, b) => b.offset - a.offset);

    const updatedTexts: Record<string, string> = {};
    fieldRanges.forEach(r => {
      updatedTexts[r.id] = r.text;
    });

    let fixCount = 0;
    sortedIssues.forEach(issue => {
      if (issue.suggestions && issue.suggestions.length > 0) {
        const field = fieldRanges.find(f => issue.offset >= f.start && issue.offset < f.end);
        if (field) {
          const relOffset = issue.offset - field.start;
          const currentText = updatedTexts[field.id];
          const replacement = issue.suggestions[0];
          
          updatedTexts[field.id] = 
            currentText.substring(0, relOffset) + 
            replacement + 
            currentText.substring(relOffset + issue.length);
            
          fixCount++;
        }
      }
    });

    fieldRanges.forEach(r => {
      r.update(updatedTexts[r.id]);
    });

    dispatch(updateResumeData(fixedData));
    setOnlineIssues([]);
    setHasChecked(false);
    alert(isRtl 
      ? `تم إصلاح ${fixCount} خطأ بنجاح وتحديث سيرتك الذاتية!` 
      : `Successfully fixed ${fixCount} grammar issues and updated your CV!`);
  };

  // ==========================================
  // 4. DICTIONARY GLOSSARY SEARCH LOGIC
  // ==========================================
  const handleDictSearch = () => {
    const q = dictQuery.trim().toLowerCase();
    if (!q) {
      setDictResult('Please type a word to search.');
      return;
    }

    if (RESUME_DICT[q]) {
      setDictResult(
        <div>
          Translation: <span className="font-bold text-emerald-400 text-base">{RESUME_DICT[q]}</span>
        </div>
      );
      return;
    }

    let matches: { en: string; ar: string }[] = [];
    Object.keys(RESUME_DICT).forEach(key => {
      if (key.includes(q) || RESUME_DICT[key].includes(q)) {
        matches.push({ en: key, ar: RESUME_DICT[key] });
      }
    });

    if (matches.length > 0) {
      setDictResult(
        <div className="space-y-1.5 mt-2">
          <div className="text-xs font-semibold text-slate-400">Found matches:</div>
          <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-slate-200">
            {matches.map((m, idx) => (
              <div key={idx} className="flex justify-between border-b border-slate-900/60 pb-1 text-xs">
                <span>{m.en}</span>
                <span className="text-emerald-400 font-semibold">{m.ar}</span>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      setDictResult('Word not found. Check spelling or try "Engineer" or "مهارات".');
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-4 shadow-md max-w-full">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-800 pb-2 gap-2">
        <button 
          onClick={() => setActiveTab('ats')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            activeTab === 'ats' 
              ? 'bg-indigo-600 text-white shadow' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          ATS Auditor
        </button>
        <button 
          onClick={() => setActiveTab('enhancv')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            activeTab === 'enhancv' 
              ? 'bg-indigo-600 text-white shadow' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          Enhancv Strength
        </button>
        <button 
          onClick={() => setActiveTab('proof')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            activeTab === 'proof' 
              ? 'bg-indigo-600 text-white shadow' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          Proofread & Translate
        </button>
      </div>

      {/* Tab 1: ATS Checklist */}
      {activeTab === 'ats' && (
        <div className="space-y-4 animation-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold">ATS Compliance Scan</h4>
              <p className="text-[11px] text-slate-400">Score based on parser constraints</p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-center ${
              totalScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
              totalScore >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
            }`}>
              <div className="text-lg font-black leading-none">{totalScore}%</div>
              <span className="text-[9px] uppercase tracking-wider font-semibold">Score</span>
            </div>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                totalScore >= 80 ? 'bg-emerald-500' :
                totalScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${totalScore}%` }}
            />
          </div>

          <ul className="space-y-2">
            {atsResults.map((check, idx) => (
              <li 
                key={idx} 
                className="flex items-start gap-2.5 bg-slate-950 p-2.5 rounded-lg border border-slate-850"
              >
                {check.passed ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <div className="font-bold text-slate-200">{check.desc}</div>
                  {!check.passed && (
                    <div className="text-[10px] text-red-400/80 mt-0.5 leading-relaxed">{check.failMsg}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tab 2: Enhancv Strength */}
      {activeTab === 'enhancv' && (
        <div className="space-y-4 animation-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold">Enhancv Score</h4>
              <p className="text-[11px] text-slate-400">Audits leadership, action, and metrics</p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-center ${
              enhancvScore >= 85 ? 'bg-emerald-500/10 text-emerald-400' :
              enhancvScore >= 55 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
            }`}>
              <div className="text-lg font-black leading-none">{enhancvScore}%</div>
              <span className="text-[9px] uppercase tracking-wider font-semibold">Score</span>
            </div>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                enhancvScore >= 85 ? 'bg-emerald-500' :
                enhancvScore >= 55 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${enhancvScore}%` }}
            />
          </div>

          <div className="space-y-3">
            {/* Metrics */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-xs">
              <div className="font-bold text-slate-200 mb-1">📊 Achievements & Metrics</div>
              <p className={`text-[10px] leading-relaxed ${
                metricScore === 35 ? 'text-emerald-400' :
                metricScore === 20 ? 'text-amber-400' : 'text-red-400'
              }`}>{metricFeedback}</p>
            </div>
            {/* Verbs */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-xs">
              <div className="font-bold text-slate-200 mb-1">🚀 Phrasing & Verbs</div>
              <p className={`text-[10px] leading-relaxed ${
                verbScore === 35 ? 'text-emerald-400' :
                verbScore === 15 ? 'text-amber-400' : 'text-red-400'
              }`}>{verbFeedback}</p>
            </div>
            {/* Clichés */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-xs">
              <div className="font-bold text-slate-200 mb-1">⚠️ Overused Words</div>
              <p className={`text-[10px] leading-relaxed ${
                buzzwordScore >= 25 ? 'text-emerald-400' : 'text-red-400'
              }`}>{buzzwordFeedback}</p>
            </div>
          </div>

          {/* Link official Enhancv */}
          <a 
            href="https://enhancv.com/resume-analyzer/" 
            target="_blank" 
            className="flex items-center justify-center gap-1.5 py-2 w-full border border-slate-800 bg-slate-950 rounded-lg text-xs hover:bg-slate-850 hover:text-slate-100 text-slate-300 font-bold transition-all"
          >
            Open Enhancv Official Analyzer
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Tab 3: Proofreader & Dictionary */}
      {activeTab === 'proof' && (
        <div className="space-y-4 animation-fade-in">
          {/* Proofreader Header */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-300">
                {isRtl ? 'المدقق اللغوي الذكي (أونلاين)' : 'Online Grammar Checker'}
              </h4>
              <p className="text-[10px] text-slate-500">
                {isRtl ? 'يتحقق من القواعد والإملاء والصياغة' : 'Scans spelling, grammar & phrasing'}
              </p>
            </div>
            
            <button
              onClick={runOnlineProofread}
              disabled={isChecking}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
            >
              {isChecking 
                ? (isRtl ? 'جاري التحقق...' : 'Scanning...') 
                : (isRtl ? 'تحقق الآن' : 'Run Check')}
            </button>
          </div>

          {/* Action button if issues found */}
          {onlineIssues.length > 0 && (
            <button 
              onClick={handleOnlineAutoFix}
              className="flex items-center justify-center gap-1.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition-colors shadow"
            >
              <Sparkles size={12} />
              {isRtl ? 'إصلاح جميع الأخطاء تلقائياً' : 'Auto-Fix All Spelling & Spacing'}
            </button>
          )}

          {/* Issue list */}
          <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {!hasChecked ? (
              <li className="flex flex-col items-center justify-center text-center py-6 bg-slate-950/40 rounded-xl border border-slate-850/50 text-xs text-slate-400">
                <Sparkles size={20} className="text-indigo-400/60 mb-2 animate-pulse" />
                <span>
                  {isRtl 
                    ? 'انقر فوق "تحقق الآن" للتدقيق اللغوي عبر الإنترنت.' 
                    : 'Click "Run Check" to proofread your text online.'}
                </span>
              </li>
            ) : onlineIssues.length === 0 ? (
              <li className="flex items-center gap-2.5 bg-slate-950 p-3 rounded-lg border border-slate-850/60 text-xs">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  {isRtl 
                    ? 'سيرتك الذاتية خالية تماماً من الأخطاء الإملائية والقواعد!' 
                    : 'Your CV is perfectly clean! No spelling or grammar errors detected.'}
                </span>
              </li>
            ) : (
              onlineIssues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850/60 text-xs">
                  <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-slate-300 leading-relaxed w-full">
                    <span className="text-[10px] text-slate-500 font-bold block mb-0.5 uppercase">
                      {issue.fieldLabel}
                    </span>
                    <p className="m-0">
                      {isRtl ? 'خطأ في كلمة ' : 'Issue with '} 
                      <strong className="text-red-400 bg-red-950/20 px-1 py-0.5 rounded">"{issue.typo}"</strong>: {issue.message}
                    </p>
                    {issue.suggestions && issue.suggestions.length > 0 && (
                      <div className="text-[10px] text-emerald-400 mt-1 flex flex-wrap items-center gap-1.5">
                        <span>{isRtl ? 'الاقتراحات:' : 'Suggestions:'}</span>
                        {issue.suggestions.map((s: string, sIdx: number) => (
                          <span key={sIdx} className="bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>

          {/* Dictionary search */}
          <div className="border-t border-slate-850 pt-4 space-y-2.5">
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wide">🌐 Bilingual Translator Dictionary</h5>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={dictQuery}
                onChange={(e) => setDictQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDictSearch()}
                placeholder="Search keywords (e.g. Developer, Managed)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 text-slate-100"
              />
              <button 
                onClick={handleDictSearch}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 rounded-lg flex items-center justify-center text-slate-200 transition-colors"
              >
                <Search size={14} />
              </button>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs text-slate-400 leading-relaxed min-h-12 flex items-center justify-center text-center">
              {dictResult}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const runProofreader = () => {
    let issues: ProofIssue[] = [];

    const auditText = (text: string, fieldName: string) => {
      if (!text) return;
      
      // Spacing
      if (/\s{2,}/.test(text)) {
        issues.push({
          type: "spacing",
          desc: `Double spacing found in ${fieldName}.`,
          border: true
        } as any);
      }

      // Capitalization
      const lowercaseMatches = text.match(/(?:^|\.\s+)([a-z])/g);
      if (lowercaseMatches) {
        issues.push({
          type: "capitalization",
          desc: `Lowercase sentence start(s) detected in ${fieldName}.`,
          fixable: true
        });
      }

      // Typos
      Object.keys(GRAMMAR_DICT).forEach(typo => {
        const regex = new RegExp(`\\b${typo}\\b`, "i");
        if (regex.test(text)) {
          issues.push({
            type: "typo",
            desc: `Spelling typo "${typo}" (should be "${GRAMMAR_DICT[typo]}") in ${fieldName}.`,
            fixable: true
          });
        }
      });

      // Passive Phrasing
      const passivePhrases = ["responsible for", "duties included", "was tasked with", "worked on"];
      passivePhrases.forEach(phrase => {
        const regex = new RegExp(`\\b${phrase}\\b`, "i");
        if (regex.test(text)) {
          issues.push({
            type: "passive",
            desc: `Passive phrase "${phrase}" detected in ${fieldName}. Try starting with a strong active verb.`,
            fixable: false
          });
        }
      });
    };

    // Scan
    auditText(data.summary, "Professional Summary");
    if (data.experience) {
      data.experience.forEach((exp, idx) => {
        auditText(exp.description, `Experience #${idx + 1} Description`);
        auditText(exp.title, `Experience #${idx + 1} Title`);
      });
    }
    if (data.projects) {
      data.projects.forEach((proj, idx) => {
        auditText(proj.description, `Project #${idx + 1} Description`);
        auditText(proj.title, `Project #${idx + 1} Title`);
      });
    }

    return issues;
  };

  const proofIssues = runProofreader();
  const hasFixables = proofIssues.some(i => i.fixable);

  // Auto-Fix implementation
  const handleAutoFix = () => {
    const fixedData = JSON.parse(JSON.stringify(data));

    const fixString = (text: string) => {
      if (!text) return "";
      let fixed = text;
      // Double spaces
      fixed = fixed.replace(/\s{2,}/g, " ");
      // Capitalization
      fixed = fixed.replace(/(^|\.\s+)([a-z])/g, (match, prefix, char) => prefix + char.toUpperCase());
      // Typos
      Object.keys(GRAMMAR_DICT).forEach(typo => {
        const regex = new RegExp(`\\b${typo}\\b`, "gi");
        fixed = fixed.replace(regex, GRAMMAR_DICT[typo]);
      });
      return fixed;
    };

    if (fixedData.summary) fixedData.summary = fixString(fixedData.summary);
    if (fixedData.experience) {
      fixedData.experience.forEach((exp: any) => {
        if (exp.description) exp.description = fixString(exp.description);
        if (exp.title) exp.title = fixString(exp.title);
      });
    }
    if (fixedData.projects) {
      fixedData.projects.forEach((proj: any) => {
        if (proj.description) proj.description = fixString(proj.description);
        if (proj.title) proj.title = fixString(proj.title);
      });
    }

    dispatch(updateResumeData(fixedData));
    alert("Autocorrect completed: Spacing and Spelling typos cleaned!");
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
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold">Offline Grammar Auditor</h4>
            {hasFixables && (
              <button 
                onClick={handleAutoFix}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded transition-colors shadow"
              >
                <Sparkles size={11} />
                Auto-Fix Spacing & Typos
              </button>
            )}
          </div>

          {/* Issue list */}
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {proofIssues.length === 0 ? (
              <li className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-xs">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="text-slate-300">All clean! No spelling or double spacing errors detected.</span>
              </li>
            ) : (
              proofIssues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-xs">
                  <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-slate-300 leading-relaxed">
                    {issue.desc}
                    {issue.fixable && (
                      <span className="text-indigo-400 font-semibold block text-[10px] mt-0.5">(Auto-fixable)</span>
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

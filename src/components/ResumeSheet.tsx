'use client';
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { ResumeData } from '@/store/resumeSlice';
import { SECTION_TRANSLATIONS } from '@/lib/dictionaries';

// Helper to format bullets into clean list items
const renderBulletPoints = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  const items = lines
    .map(line => {
      let clean = line.trim();
      if (clean.length === 0) return null;
      if (clean.startsWith('-') || clean.startsWith('*') || clean.startsWith('•')) {
        clean = clean.substring(1).trim();
      }
      return clean;
    })
    .filter(Boolean);

  if (items.length === 0) return null;
  return (
    <ul className="list-disc ps-5 mt-1 mb-2 space-y-1">
      {items.map((item, idx) => (
        <li key={idx} className="text-[10pt] text-slate-700 leading-relaxed">{item}</li>
      ))}
    </ul>
  );
};

export default function ResumeSheet() {
  const { resumes, activeResumeId } = useAppSelector(state => state.resume);
  const isUnlocked = useAppSelector(state => state.payment.isUnlocked);
  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  const [isWindowFocused, setIsWindowFocused] = useState(true);

  useEffect(() => {
    if (isUnlocked) return;

    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isEditing = 
        activeEl?.tagName === 'INPUT' || 
        activeEl?.tagName === 'TEXTAREA' || 
        activeEl?.getAttribute('contenteditable') === 'true';

      if (isEditing) return;

      // Block Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        alert(activeResume?.language === 'ar' ? 'يرجى إلغاء قفل المستند لطباعته.' : 'Please unlock the document to print.');
        return;
      }
      
      // Block Ctrl+C / Cmd+C / Ctrl+X
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x')) {
        e.preventDefault();
        alert(activeResume?.language === 'ar' ? 'نسخ النص معطل في المعاينة.' : 'Copying text is disabled in preview.');
        return;
      }

      // Block F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' || 
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        return;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      const activeEl = document.activeElement;
      const isEditing = 
        activeEl?.tagName === 'INPUT' || 
        activeEl?.tagName === 'TEXTAREA';
      
      if (isEditing) return;

      const previewArea = document.getElementById('resumePreviewSheet');
      if (previewArea && previewArea.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      const isEditing = 
        activeEl?.tagName === 'INPUT' || 
        activeEl?.tagName === 'TEXTAREA';
      
      if (isEditing) return;

      e.preventDefault();
      alert(activeResume?.language === 'ar' ? 'نسخ النص معطل في المعاينة.' : 'Copying text is disabled in preview.');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
    };
  }, [isUnlocked, activeResume?.language]);

  if (!activeResume) {
    return (
      <div className="bg-white text-slate-400 text-center py-20 rounded-xl shadow-lg border border-slate-200">
        Resume empty. Load sample data or write details to preview.
      </div>
    );
  }

  const { template, font, fontSize, themeColor, language, data } = activeResume;
  const { personal, summary, experience, skills, education, projects, custom } = data;
  
  const isRtl = language === 'ar';
  const headings = SECTION_TRANSLATIONS[language] || SECTION_TRANSLATIONS['en'];

  // Style helper based on active font and size selections
  const sheetStyle: React.CSSProperties = {
    fontFamily: font,
    fontSize: fontSize,
  };

  // Filter contact info items to render separator pipes in Ivy League template
  const contactInfo = [
    personal.email && { label: isRtl ? 'البريد الالكتروني' : 'Email', value: personal.email },
    personal.phone && { label: isRtl ? 'الهاتف' : 'Phone', value: personal.phone },
    personal.location && { label: isRtl ? 'الموقع' : 'Location', value: personal.location },
    personal.linkedin && { label: 'LinkedIn', value: personal.linkedin },
    personal.website && { label: 'Website', value: personal.website }
  ].filter((x): x is { label: string; value: string } => !!x);

  const isLocked = !isUnlocked;

  return (
    <div className="paper-viewport w-full overflow-x-auto pb-8 flex justify-center relative">
      {isLocked && !isWindowFocused && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6 rounded-2xl select-none">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl max-w-sm">
            <div className="text-indigo-400 font-bold mb-2 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              {isRtl ? 'حماية لقطة الشاشة نشطة' : 'Screen Capture Protection'}
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {isRtl 
                ? 'تم إخفاء المعاينة مؤقتاً لمنع لقطات الشاشة غير المصرح بها. انقر هنا للمتابعة.' 
                : 'Preview is temporarily hidden to prevent unauthorized screenshots. Click inside the window to resume.'}
            </p>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="locked-print-warning hidden">
          <h2 className="text-red-600 text-2xl font-bold uppercase mb-2">
            {isRtl ? 'المستند مقفل' : 'DOCUMENT LOCKED'}
          </h2>
          <p className="text-slate-700 text-base">
            {isRtl 
              ? 'يرجى شراء رمز تفعيل لتنزيل أو طباعة السيرة الذاتية بصيغة PDF.' 
              : 'Please unlock the document on the website to print or download as PDF.'}
          </p>
        </div>
      )}

      <div 
        id="resumePreviewSheet"
        className={`resume-sheet ${template} ${themeColor} ${isRtl ? 'rtl-mode' : ''} ${
          isLocked ? 'locked-preview' : ''
        } ${isLocked && !isWindowFocused ? 'blurred-content' : ''}`}
        style={sheetStyle}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* ==================== HEADER SECTION ==================== */}
        {(personal.fullName || personal.jobTitle) && (
          <div className="preview-header-wrapper border-b border-slate-200 pb-4 mb-4 flex items-center justify-between gap-6">
            {/* Standard Left Text / Right Photo layout */}
            {template !== 'template-ivyleague' && template !== 'template-classic' && template !== 'template-executive' ? (
              <>
                <div className="preview-header-text flex-1">
                  <h1 className="text-[24pt] font-extrabold text-slate-900 leading-tight tracking-tight m-0">
                    {personal.fullName || (isRtl ? 'الاسم الكامل' : 'Your Name')}
                  </h1>
                  <div className="job-title text-[13pt] font-semibold text-slate-500 mt-1">
                    {personal.jobTitle || (isRtl ? 'المسمى الوظيفي' : 'Job Title')}
                  </div>
                  <div className="preview-contact flex flex-wrap gap-x-4 gap-y-1.5 text-[8.5pt] text-slate-600 mt-2">
                    {contactInfo.map((item, idx) => (
                      <span key={idx} className="preview-contact-item">
                        <strong>{item.label}:</strong> {item.value}
                      </span>
                    ))}
                  </div>
                </div>
                {personal.photo && (
                  <img 
                    src={personal.photo} 
                    className="preview-photo w-[85px] height-[85px] rounded-full object-cover border-2 border-slate-200 shadow-sm"
                    alt={personal.fullName}
                  />
                )}
              </>
            ) : (
              /* Centered layouts: Ivy League, Classic, Executive */
              <div className="preview-header-text flex-1 flex flex-col items-center text-center">
                {personal.photo && (
                  <img 
                    src={personal.photo} 
                    className="preview-photo w-[85px] height-[85px] rounded-full object-cover border-2 border-slate-200 shadow-sm mb-3"
                    alt={personal.fullName}
                  />
                )}
                <h1 className="text-[24pt] font-extrabold text-slate-900 leading-tight tracking-tight m-0">
                  {personal.fullName || (isRtl ? 'الاسم الكامل' : 'Your Name')}
                </h1>
                <div className="job-title text-[13pt] font-semibold text-slate-500 mt-1 italic">
                  {personal.jobTitle || (isRtl ? 'المسمى الوظيفي' : 'Job Title')}
                </div>
                <div className="preview-contact flex flex-wrap justify-center gap-x-2 gap-y-1 text-[8.5pt] text-slate-600 mt-2.5">
                  {contactInfo.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <span className="preview-contact-item">
                        <strong>{item.label}:</strong> {item.value}
                      </span>
                      {idx < contactInfo.length - 1 && (
                        <span className="text-slate-300 hidden sm:inline">|</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SUMMARY SECTION ==================== */}
        {summary && (
          <div className="resume-section mb-4">
            <h2 className="resume-section-title text-[13pt] font-bold uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-200">
              {headings.summary}
            </h2>
            <p className="text-[10pt] text-slate-700 leading-relaxed m-0">{summary}</p>
          </div>
        )}

        {/* ==================== WORK EXPERIENCE ==================== */}
        {experience && experience.length > 0 && (
          <div className="resume-section mb-4">
            <h2 className="resume-section-title text-[13pt] font-bold uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-200">
              {headings.experience}
            </h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => {
                if (!exp.title && !exp.company) return null;
                return (
                  <div key={idx} className="preview-item page-break-inside-avoid">
                    <div className="preview-item-header flex justify-between font-bold text-[10.5pt] text-slate-900">
                      <span>{exp.title || (isRtl ? 'المسمى الوظيفي' : 'Job Title')}</span>
                      <span>{exp.dates || (isRtl ? 'التواريخ' : 'Dates')}</span>
                    </div>
                    <div className="preview-item-sub flex justify-between text-[9.5pt] text-slate-500 italic mt-0.5 mb-1.5">
                      <span>{exp.company || (isRtl ? 'الشركة' : 'Company')}</span>
                      <span>{exp.location || (isRtl ? 'الموقع' : 'Location')}</span>
                    </div>
                    {exp.description && (
                      <div className="preview-item-desc text-[10pt] text-slate-700">
                        {renderBulletPoints(exp.description)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== PROJECTS SECTION ==================== */}
        {projects && projects.length > 0 && (
          <div className="resume-section mb-4">
            <h2 className="resume-section-title text-[13pt] font-bold uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-200">
              {headings.projects}
            </h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => {
                if (!proj.title) return null;
                return (
                  <div key={idx} className="preview-item page-break-inside-avoid">
                    <div className="preview-item-header flex justify-between font-bold text-[10.5pt] text-slate-900">
                      <span>
                        {proj.title}
                        {proj.role && (
                          <span className="font-normal text-slate-400 text-[0.85em] ml-2">
                            | {proj.role}
                          </span>
                        )}
                      </span>
                      {proj.link && (
                        <span className="font-normal text-[0.85em] text-indigo-600 hover:underline">
                          {proj.link}
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <div className="preview-item-desc text-[10pt] text-slate-700 mt-1">
                        {renderBulletPoints(proj.description)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== EDUCATION SECTION ==================== */}
        {education && education.length > 0 && (
          <div className="resume-section mb-4">
            <h2 className="resume-section-title text-[13pt] font-bold uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-200">
              {headings.education}
            </h2>
            <div className="space-y-4">
              {education.map((edu, idx) => {
                if (!edu.degree && !edu.school) return null;
                return (
                  <div key={idx} className="preview-item page-break-inside-avoid">
                    <div className="preview-item-header flex justify-between font-bold text-[10.5pt] text-slate-900">
                      <span>{edu.degree || (isRtl ? 'الشهادة' : 'Degree')}</span>
                      <span>{edu.date || (isRtl ? 'التاريخ' : 'Graduation')}</span>
                    </div>
                    <div className="preview-item-sub flex justify-between text-[9.5pt] text-slate-500 italic mt-0.5 mb-1.5">
                      <span>{edu.school || (isRtl ? 'المؤسسة التعليمية' : 'School')}</span>
                      <span>{edu.location || (isRtl ? 'الموقع' : 'Location')}</span>
                    </div>
                    {edu.description && (
                      <p className="text-[10pt] text-slate-700 leading-relaxed mt-1 mb-0">{edu.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== SKILLS SECTION ==================== */}
        {skills && skills.length > 0 && (
          <div className="resume-section mb-4">
            <h2 className="resume-section-title text-[13pt] font-bold uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-200">
              {headings.skills}
            </h2>
            <div className="preview-skills-grid grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
              {skills.map((skill, idx) => {
                if (!skill.category && !skill.list) return null;
                return (
                  <div key={idx} className="preview-skill-group page-break-inside-avoid">
                    <div className="preview-skill-cat font-bold text-[9.5pt] text-slate-900">
                      {skill.category || (isRtl ? 'التصنيف' : 'Skills Category')}
                    </div>
                    <div className="preview-skill-list text-[9pt] text-slate-500 leading-relaxed">
                      {skill.list || (isRtl ? 'مهارة ١، مهارة ٢' : 'Skill 1, Skill 2')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== CUSTOM SECTIONS ==================== */}
        {custom && custom.length > 0 && (
          <div className="space-y-4">
            {custom.map((sec, idx) => {
              if (!sec.title) return null;
              return (
                <div key={idx} className="resume-section mb-4">
                  <h2 className="resume-section-title text-[13pt] font-bold uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-200">
                    {sec.title}
                  </h2>
                  <div className="preview-custom-content text-[10pt] text-slate-700 leading-relaxed">
                    {renderBulletPoints(sec.content)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

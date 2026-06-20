import { Resume } from "@/store/resumeSlice";
import { SECTION_TRANSLATIONS } from "./dictionaries";

export const exportToWord = (resume: Resume, previewHtml: string) => {
  if (!previewHtml) {
    alert("Resume content is empty.");
    return;
  }

  const langAttr = resume.language === 'ar' ? 'dir="rtl" lang="ar"' : 'dir="ltr" lang="en"';

  const wordContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${resume.name}</title>
      <style>
        body {
          font-family: ${resume.font};
          font-size: ${resume.fontSize};
          background: #ffffff;
          color: #000000;
          margin: 1in;
        }
        .resume-sheet {
          width: 100% !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .resume-section-title {
          border-bottom: 2px solid #000000;
          margin-top: 15pt;
          margin-bottom: 8pt;
          font-size: 13pt;
          font-weight: bold;
        }
        .preview-item { margin-bottom: 8pt; }
        ul { margin-top: 0px; margin-bottom: 6px; }
      </style>
    </head>
    <body ${langAttr}>
      <div class="resume-sheet ${resume.template} theme-dark">
        ${previewHtml}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resume.name.toLowerCase().replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const exportToPlainText = (resume: Resume) => {
  const data = resume.data;
  const p = data.personal || {};
  const lang = resume.language || "en";
  const headings = SECTION_TRANSLATIONS[lang] || SECTION_TRANSLATIONS["en"];

  let text = "";

  if (p.fullName) text += `${p.fullName.toUpperCase()}\n`;
  if (p.jobTitle) text += `${p.jobTitle}\n`;
  
  let contact = [];
  if (p.email) contact.push(p.email);
  if (p.phone) contact.push(p.phone);
  if (p.location) contact.push(p.location);
  if (p.linkedin) contact.push(p.linkedin);
  if (p.website) contact.push(p.website);
  
  if (contact.length > 0) {
    text += `${contact.join(" | ")}\n`;
  }
  text += "\n";

  if (data.summary) {
    text += `${headings.summary.toUpperCase()}\n`;
    text += `${"=".repeat(headings.summary.length)}\n`;
    text += `${data.summary}\n\n`;
  }

  if (data.experience && data.experience.length > 0) {
    text += `${headings.experience.toUpperCase()}\n`;
    text += `${"=".repeat(headings.experience.length)}\n`;
    data.experience.forEach(exp => {
      if (!exp.title && !exp.company) return;
      text += `${exp.title.toUpperCase()} | ${exp.company}\n`;
      text += `${exp.dates} | ${exp.location || ''}\n`;
      if (exp.description) {
        const cleanDesc = exp.description.split("\n").map(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith("-") || trimmed.startsWith("*")) return trimmed;
          return `- ${trimmed}`;
        }).join("\n");
        text += `${cleanDesc}\n`;
      }
      text += "\n";
    });
  }

  if (data.projects && data.projects.length > 0) {
    text += `${headings.projects.toUpperCase()}\n`;
    text += `${"=".repeat(headings.projects.length)}\n`;
    data.projects.forEach(proj => {
      if (!proj.title) return;
      text += `${proj.title} ${proj.role ? `(${proj.role})` : ''}\n`;
      if (proj.link) text += `Link: ${proj.link}\n`;
      if (proj.description) {
        const cleanDesc = proj.description.split("\n").map(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith("-") || trimmed.startsWith("*")) return trimmed;
          return `- ${trimmed}`;
        }).join("\n");
        text += `${cleanDesc}\n`;
      }
      text += "\n";
    });
  }

  if (data.education && data.education.length > 0) {
    text += `${headings.education.toUpperCase()}\n`;
    text += `${"=".repeat(headings.education.length)}\n`;
    data.education.forEach(edu => {
      if (!edu.degree && !edu.school) return;
      text += `${edu.degree} - ${edu.school} (${edu.location || ''})\n`;
      text += `Graduation: ${edu.date || ''}\n`;
      if (edu.description) text += `${edu.description}\n`;
      text += "\n";
    });
  }

  if (data.skills && data.skills.length > 0) {
    text += `${headings.skills.toUpperCase()}\n`;
    text += `${"=".repeat(headings.skills.length)}\n`;
    data.skills.forEach(skill => {
      if (!skill.category && !skill.list) return;
      text += `${skill.category}: ${skill.list}\n`;
    });
    text += "\n";
  }

  if (data.custom && data.custom.length > 0) {
    data.custom.forEach(sec => {
      if (!sec.title) return;
      text += `${sec.title.toUpperCase()}\n`;
      text += `=${"=".repeat(sec.title.length)}\n`;
      text += `${sec.content}\n\n`;
    });
  }

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resume.name.toLowerCase().replace(/\s+/g, '_')}_plaintext.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

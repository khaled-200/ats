// Mappings for LTR/RTL bilingual section titles
export const SECTION_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects"
  },
  ar: {
    summary: "الملخص المهني",
    experience: "الخبرات المهنية",
    education: "التعليم والشهادات الاكاديمية",
    skills: "المهارات التقنية والعملية",
    projects: "المشاريع المميزة"
  }
};

// Bilingual Translation Dictionary (English <-> Arabic)
export const RESUME_DICT: Record<string, string> = {
  "developer": "مطور برمجيات",
  "software engineer": "مهندس برمجيات",
  "project manager": "مدير مشاريع",
  "designer": "مصمم",
  "skills": "مهارات",
  "experience": "الخبرة العمليّة",
  "education": "التعليم",
  "summary": "ملخص تنفيذي",
  "projects": "المشاريع",
  "led": "قاد / أشرف على",
  "managed": "أدار",
  "designed": "صمم",
  "built": "بنى / طور",
  "developed": "طور",
  "implemented": "نفّذ / طبّق",
  "optimized": "حسّن / رفع كفاءة",
  "reduced": "قلّل / خفّض",
  "increased": "زاد / رفع نسب",
  "achieved": "حقّق",
  "created": "أنشأ / ابتكر",
  "launched": "أطلق",
  "saved": "وفر",
  "team player": "متعاون مع الفريق",
  "certified": "معتمد",
  "university": "جامعة",
  "college": "كلية",
  "bachelor": "بكالوريوس",
  "master": "ماجستير",
  "phd": "دكتوراه",
  "courses": "دورات تدريبية",
  "languages": "اللغات",
  "arabic": "العربية",
  "english": "الإنجليزية",
  
  "مهندس برمجيات": "Software Engineer",
  "مطور": "Developer / Builder",
  "خبرة": "Experience / Work History",
  "تعليم": "Education / Qualifications",
  "مهارات": "Skills / Technologies",
  "ملخص": "Summary / Executive Profile",
  "قاد": "Led / Orchestrated",
  "أدار": "Managed / Directed",
  "صمم": "Designed / Modelled",
  "طور": "Developed / Built",
  "حسّن": "Optimized / Enhanced",
  "مشروع": "Project",
  "مشاريع": "Projects",
  "جامعة": "University",
  "شهادة": "Certificate / Degree",
  "برمجة": "Programming / Coding"
};

// Common Spelling Typos & Punctuation Auto-Corrections
export const GRAMMAR_DICT: Record<string, string> = {
  "recieve": "receive",
  "recieved": "received",
  "seperate": "separate",
  "seperated": "separated",
  "definately": "definitely",
  "untill": "until",
  "truely": "truly",
  "goverment": "government",
  "enviroment": "environment",
  "colleague": "colleague",
  "sucessful": "successful"
};

// Enhancv Scorer - Phrasing Action Verbs
export const ACTION_VERBS = [
  "led", "built", "managed", "designed", "developed", "implemented", "optimized", "reduced",
  "increased", "achieved", "created", "launched", "saved", "orchestrated", "architected", "delivered",
  "improved", "automated", "cut", "decreased", "mentored", "trained", "negotiated", "authored",
  "drove", "executed", "headed", "restructured", "upgraded", "expanded", "formulated", "overhauled"
];

// Enhancv Scorer - Cliché Buzzwords to avoid
export const CLICHE_BUZZWORDS = [
  "detail-oriented", "hard worker", "team player", "go-getter", "results-oriented", "self-starter",
  "think outside the box", "synergy", "dynamic", "motivated", "enthusiastic", "track record",
  "strategic thinker", "passionate", "proactive", "value add"
];

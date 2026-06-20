import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ExperienceItem {
  title: string;
  company: string;
  location: string;
  dates: string;
  description: string;
}

export interface SkillCategory {
  category: string;
  list: string;
}

export interface EducationItem {
  degree: string;
  school: string;
  location: string;
  date: string;
  description: string;
}

export interface ProjectItem {
  title: string;
  role: string;
  link: string;
  description: string;
}

export interface CustomSectionItem {
  title: string;
  content: string;
}

export interface ResumeData {
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    photo: string;
  };
  summary: string;
  experience: ExperienceItem[];
  skills: SkillCategory[];
  education: EducationItem[];
  projects: ProjectItem[];
  custom: CustomSectionItem[];
}

export interface Resume {
  id: string;
  name: string;
  template: string;
  font: string;
  fontSize: string;
  themeColor: string;
  language: string;
  data: ResumeData;
}

interface ResumeState {
  resumes: Resume[];
  activeResumeId: string;
}

const SAMPLE_RESUME_DATA: ResumeData = {
  personal: {
    fullName: "Alex Mercer",
    jobTitle: "Senior Full Stack Engineer",
    email: "alex.mercer@email.com",
    phone: "+1 (555) 382-9102",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmercer-dev",
    website: "alexmercer.dev",
    photo: ""
  },
  summary: "Results-driven Full Stack Engineer with 7+ years of experience designing, building, and deploying scalable web applications. Expert in React, Node.js, and cloud architecture (AWS). Proven track record of optimizing application performance by 40% and leading cross-functional developer teams to deliver projects 15% ahead of schedule.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "CloudScale Technologies",
      location: "San Francisco, CA",
      dates: "2023 - Present",
      description: "- Architected and deployed microservices using Node.js, React, and AWS ECS, improving system uptime to 99.99%.\n- Led a team of 4 engineers to rebuild the core billing engine, resulting in a 25% decrease in transaction processing failures.\n- Optimized Database queries and implemented Redis caching, reducing API latency by 180ms."
    },
    {
      title: "Full Stack Developer",
      company: "Fintech Innovators",
      location: "New York, NY",
      dates: "2020 - 2023",
      description: "- Designed and implemented responsive dashboards using React and TypeScript, increasing user retention by 15%.\n- Developed RESTful APIs using Python (FastAPI) and PostgreSQL, handling over 2M requests daily.\n- Integrated stripe billing API and automated invoicing system, saving 10+ engineering hours weekly."
    }
  ],
  skills: [
    {
      category: "Programming Languages",
      list: "JavaScript, TypeScript, Python, HTML5, CSS3, SQL, Go"
    },
    {
      category: "Frameworks & Tools",
      list: "React, Node.js, Express, FastAPI, PostgreSQL, MongoDB, Redis, Docker, Git"
    },
    {
      category: "Cloud & Devops",
      list: "AWS (S3, EC2, ECS, Lambda), CI/CD (GitHub Actions), Linux"
    }
  ],
  education: [
    {
      degree: "B.S. in Computer Science",
      school: "University of California, Berkeley",
      location: "Berkeley, CA",
      date: "2016 - 2020",
      description: "Graduated with Honors. Focus on Systems Architecture and Database Design."
    }
  ],
  projects: [
    {
      title: "TaskFlow Agile Planner",
      role: "Creator & Lead Developer",
      link: "github.com/alexmercer/taskflow",
      description: "- Built an offline-first task board app using React, IndexedDB, and Web Workers, gaining 5,000+ stars on GitHub.\n- Implemented real-time synchronization utilizing WebSockets and Node.js backend."
    }
  ],
  custom: [
    {
      title: "Certifications",
      content: "- AWS Certified Solutions Architect (Associate)\n- Certified ScrumMaster (CSM)"
    }
  ]
};

const createDefaultResume = (name: string): Resume => ({
  id: "resume_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
  name,
  template: "template-modern",
  font: "Arial, sans-serif",
  fontSize: "11pt",
  themeColor: "theme-navy",
  language: "en",
  data: JSON.parse(JSON.stringify(SAMPLE_RESUME_DATA))
});

const initialState: ResumeState = {
  resumes: [],
  activeResumeId: ""
};

export const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setResumesState: (state, action: PayloadAction<{ resumes: Resume[]; activeResumeId: string }>) => {
      state.resumes = action.payload.resumes;
      state.activeResumeId = action.payload.activeResumeId;
    },
    addResume: (state, action: PayloadAction<string>) => {
      const newResume = createDefaultResume(action.payload);
      state.resumes.push(newResume);
      state.activeResumeId = newResume.id;
    },
    renameResume: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const r = state.resumes.find(x => x.id === action.payload.id);
      if (r) r.name = action.payload.name;
    },
    cloneResume: (state, action: PayloadAction<string>) => {
      const origin = state.resumes.find(x => x.id === action.payload);
      if (origin) {
        const copy = JSON.parse(JSON.stringify(origin)) as Resume;
        copy.id = "resume_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        copy.name = `${origin.name} (Copy)`;
        state.resumes.push(copy);
        state.activeResumeId = copy.id;
      }
    },
    deleteResume: (state, action: PayloadAction<string>) => {
      if (state.resumes.length <= 1) return;
      state.resumes = state.resumes.filter(x => x.id !== action.payload);
      if (state.activeResumeId === action.payload) {
        state.activeResumeId = state.resumes[0].id;
      }
    },
    setActiveResumeId: (state, action: PayloadAction<string>) => {
      state.activeResumeId = action.payload;
    },
    updateResumeMeta: (state, action: PayloadAction<{ template?: string; font?: string; fontSize?: string; themeColor?: string; language?: string }>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        Object.assign(active, action.payload);
      }
    },
    updatePersonalInfo: (state, action: PayloadAction<Partial<ResumeData["personal"]>>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data.personal = { ...active.data.personal, ...action.payload };
      }
    },
    updateSummary: (state, action: PayloadAction<string>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) active.data.summary = action.payload;
    },
    updateResumeData: (state, action: PayloadAction<ResumeData>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) active.data = action.payload;
    },
    // Experience actions
    addExperience: (state) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data.experience.push({ title: "", company: "", location: "", dates: "", description: "" });
      }
    },
    updateExperience: (state, action: PayloadAction<{ index: number; fields: Partial<ExperienceItem> }>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active && active.data.experience[action.payload.index]) {
        active.data.experience[action.payload.index] = {
          ...active.data.experience[action.payload.index],
          ...action.payload.fields
        };
      }
    },
    deleteExperience: (state, action: PayloadAction<number>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data.experience.splice(action.payload, 1);
      }
    },
    // Skills actions
    addSkill: (state) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data.skills.push({ category: "", list: "" });
      }
    },
    updateSkill: (state, action: PayloadAction<{ index: number; fields: Partial<SkillCategory> }>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active && active.data.skills[action.payload.index]) {
        active.data.skills[action.payload.index] = {
          ...active.data.skills[action.payload.index],
          ...action.payload.fields
        };
      }
    },
    deleteSkill: (state, action: PayloadAction<number>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data.skills.splice(action.payload, 1);
      }
    },
    // Education actions
    addEducation: (state) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data.education.push({ degree: "", school: "", location: "", date: "", description: "" });
      }
    },
    updateEducation: (state, action: PayloadAction<{ index: number; fields: Partial<EducationItem> }>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active && active.data.education[action.payload.index]) {
        active.data.education[action.payload.index] = {
          ...active.data.education[action.payload.index],
          ...action.payload.fields
        };
      }
    },
    deleteEducation: (state, action: PayloadAction<number>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data.education.splice(action.payload, 1);
      }
    },
    // Projects actions
    addProject: (state) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data.projects.push({ title: "", role: "", link: "", description: "" });
      }
    },
    updateProject: (state, action: PayloadAction<{ index: number; fields: Partial<ProjectItem> }>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active && active.data.projects[action.payload.index]) {
        active.data.projects[action.payload.index] = {
          ...active.data.projects[action.payload.index],
          ...action.payload.fields
        };
      }
    },
    deleteProject: (state, action: PayloadAction<number>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data.projects.splice(action.payload, 1);
      }
    },
    // Custom section actions
    addCustomSection: (state) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data.custom.push({ title: "New Custom Section", content: "" });
      }
    },
    updateCustomSection: (state, action: PayloadAction<{ index: number; fields: Partial<CustomSectionItem> }>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active && active.data.custom[action.payload.index]) {
        active.data.custom[action.payload.index] = {
          ...active.data.custom[action.payload.index],
          ...action.payload.fields
        };
      }
    },
    deleteCustomSection: (state, action: PayloadAction<number>) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data.custom.splice(action.payload, 1);
      }
    },
    loadSampleData: (state) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data = JSON.parse(JSON.stringify(SAMPLE_RESUME_DATA));
      }
    },
    clearActiveData: (state) => {
      const active = state.resumes.find(x => x.id === state.activeResumeId);
      if (active) {
        active.data = {
          personal: { fullName: "", jobTitle: "", email: "", phone: "", location: "", linkedin: "", website: "", photo: "" },
          summary: "",
          experience: [],
          skills: [],
          education: [],
          projects: [],
          custom: []
        };
      }
    }
  }
});

export const {
  setResumesState,
  addResume,
  renameResume,
  cloneResume,
  deleteResume,
  setActiveResumeId,
  updateResumeMeta,
  updatePersonalInfo,
  updateSummary,
  updateResumeData,
  addExperience,
  updateExperience,
  deleteExperience,
  addSkill,
  updateSkill,
  deleteSkill,
  addEducation,
  updateEducation,
  deleteEducation,
  addProject,
  updateProject,
  deleteProject,
  addCustomSection,
  updateCustomSection,
  deleteCustomSection,
  loadSampleData,
  clearActiveData
} = resumeSlice.actions;

export default resumeSlice.reducer;

'use client';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  updatePersonalInfo, updateSummary,
  addExperience, updateExperience, deleteExperience,
  addSkill, updateSkill, deleteSkill,
  addEducation, updateEducation, deleteEducation,
  addProject, updateProject, deleteProject,
  addCustomSection, updateCustomSection, deleteCustomSection
} from '@/store/resumeSlice';
import { 
  User, AlignLeft, Briefcase, Award, GraduationCap, FolderGit, FolderPlus, Trash2, Plus, Image
} from 'lucide-react';

export default function EditorAccordion() {
  const dispatch = useAppDispatch();
  const { resumes, activeResumeId } = useAppSelector(state => state.resume);
  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  const [activeSection, setActiveSection] = useState<string>('personal');

  if (!activeResume) return null;

  const { data } = activeResume;
  const { personal, summary, experience, skills, education, projects, custom } = data;

  const toggleSection = (sectionName: string) => {
    setActiveSection(activeSection === sectionName ? '' : sectionName);
  };

  // Profile Picture File Uploader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        dispatch(updatePersonalInfo({ photo: evt.target.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    dispatch(updatePersonalInfo({ photo: "" }));
  };

  return (
    <div className="space-y-4 max-w-full">
      {/* 1. PERSONAL DETAILS SECTION */}
      <div className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
        activeSection === 'personal' ? 'border-indigo-500/50 shadow-lg' : 'border-slate-800'
      }`}>
        <button 
          onClick={() => toggleSection('personal')}
          className="w-full flex items-center justify-between p-4 bg-slate-900/60 font-semibold text-sm text-left hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-indigo-400">
            <User size={16} />
            Personal Details
          </span>
          <span className="text-slate-400">{activeSection === 'personal' ? '▼' : '▶'}</span>
        </button>
        
        {activeSection === 'personal' && (
          <div className="p-4 border-t border-slate-850 space-y-4">
            {/* Photo Uploader */}
            <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-850">
              <div className="flex-1 space-y-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase">Profile Picture</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>
              {personal.photo ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div 
                    className="w-12 h-12 rounded-full border border-slate-800 bg-cover bg-center shadow-inner"
                    style={{ backgroundImage: `url(${personal.photo})` }}
                  />
                  <button 
                    onClick={handleRemovePhoto}
                    className="text-[10px] text-red-400 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full border border-slate-800/80 bg-slate-900 flex items-center justify-center text-slate-500">
                  <Image size={18} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Full Name *</label>
                <input 
                  type="text" 
                  value={personal.fullName || ""}
                  onChange={(e) => dispatch(updatePersonalInfo({ fullName: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Job Title *</label>
                <input 
                  type="text" 
                  value={personal.jobTitle || ""}
                  onChange={(e) => dispatch(updatePersonalInfo({ jobTitle: e.target.value }))}
                  placeholder="e.g. Software Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Email Address *</label>
                <input 
                  type="email" 
                  value={personal.email || ""}
                  onChange={(e) => dispatch(updatePersonalInfo({ email: e.target.value }))}
                  placeholder="john.doe@email.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Phone Number *</label>
                <input 
                  type="tel" 
                  value={personal.phone || ""}
                  onChange={(e) => dispatch(updatePersonalInfo({ phone: e.target.value }))}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Location / City *</label>
                <input 
                  type="text" 
                  value={personal.location || ""}
                  onChange={(e) => dispatch(updatePersonalInfo({ location: e.target.value }))}
                  placeholder="New York, NY"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">LinkedIn Profile URL</label>
                <input 
                  type="text" 
                  value={personal.linkedin || ""}
                  onChange={(e) => dispatch(updatePersonalInfo({ linkedin: e.target.value }))}
                  placeholder="linkedin.com/in/johndoe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Website / Portfolio URL</label>
              <input 
                type="text" 
                value={personal.website || ""}
                onChange={(e) => dispatch(updatePersonalInfo({ website: e.target.value }))}
                placeholder="johndoe.dev"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. PROFESSIONAL SUMMARY SECTION */}
      <div className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
        activeSection === 'summary' ? 'border-indigo-500/50 shadow-lg' : 'border-slate-800'
      }`}>
        <button 
          onClick={() => toggleSection('summary')}
          className="w-full flex items-center justify-between p-4 bg-slate-900/60 font-semibold text-sm text-left hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-indigo-400">
            <AlignLeft size={16} />
            Professional Summary
          </span>
          <span className="text-slate-400">{activeSection === 'summary' ? '▼' : '▶'}</span>
        </button>

        {activeSection === 'summary' && (
          <div className="p-4 border-t border-slate-850 space-y-1">
            <label className="text-xs font-semibold text-slate-400">Summary Text *</label>
            <textarea 
              rows={4}
              value={summary || ""}
              onChange={(e) => dispatch(updateSummary(e.target.value))}
              placeholder="Briefly summarize your key skills, experience, and career goals (3-5 sentences)."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {/* 3. WORK EXPERIENCE SECTION */}
      <div className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
        activeSection === 'experience' ? 'border-indigo-500/50 shadow-lg' : 'border-slate-800'
      }`}>
        <button 
          onClick={() => toggleSection('experience')}
          className="w-full flex items-center justify-between p-4 bg-slate-900/60 font-semibold text-sm text-left hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-indigo-400">
            <Briefcase size={16} />
            Work Experience
          </span>
          <span className="text-slate-400">{activeSection === 'experience' ? '▼' : '▶'}</span>
        </button>

        {activeSection === 'experience' && (
          <div className="p-4 border-t border-slate-850 space-y-4">
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                    <span className="text-xs font-bold text-slate-400">Job #{idx + 1}</span>
                    <button 
                      onClick={() => dispatch(deleteExperience(idx))}
                      className="p-1 hover:bg-slate-800 text-red-400 hover:text-red-300 rounded"
                      title="Remove Job Entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Job Title</label>
                      <input 
                        type="text" 
                        value={exp.title}
                        onChange={(e) => dispatch(updateExperience({ index: idx, fields: { title: e.target.value } }))}
                        placeholder="e.g. Senior Developer"
                        className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Company Name</label>
                      <input 
                        type="text" 
                        value={exp.company}
                        onChange={(e) => dispatch(updateExperience({ index: idx, fields: { company: e.target.value } }))}
                        placeholder="e.g. Google"
                        className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Location</label>
                      <input 
                        type="text" 
                        value={exp.location}
                        onChange={(e) => dispatch(updateExperience({ index: idx, fields: { location: e.target.value } }))}
                        placeholder="e.g. San Francisco, CA"
                        className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Dates (Start - End)</label>
                      <input 
                        type="text" 
                        value={exp.dates}
                        onChange={(e) => dispatch(updateExperience({ index: idx, fields: { dates: e.target.value } }))}
                        placeholder="e.g. 2021 - Present"
                        className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Achievements (One bullet per line)</label>
                    <textarea 
                      rows={3}
                      value={exp.description}
                      onChange={(e) => dispatch(updateExperience({ index: idx, fields: { description: e.target.value } }))}
                      placeholder="- Developed application reducing bundle size by 30%"
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => dispatch(addExperience())}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:text-slate-100 text-slate-300 text-xs font-bold transition-all"
            >
              <Plus size={14} />
              Add Job Experience
            </button>
          </div>
        )}
      </div>

      {/* 4. CORE SKILLS SECTION */}
      <div className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
        activeSection === 'skills' ? 'border-indigo-500/50 shadow-lg' : 'border-slate-800'
      }`}>
        <button 
          onClick={() => toggleSection('skills')}
          className="w-full flex items-center justify-between p-4 bg-slate-900/60 font-semibold text-sm text-left hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-indigo-400">
            <Award size={16} />
            Core Skills
          </span>
          <span className="text-slate-400">{activeSection === 'skills' ? '▼' : '▶'}</span>
        </button>

        {activeSection === 'skills' && (
          <div className="p-4 border-t border-slate-850 space-y-4">
            <div className="space-y-4">
              {skills.map((skill, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                    <span className="text-xs font-bold text-slate-400">Category #{idx + 1}</span>
                    <button 
                      onClick={() => dispatch(deleteSkill(idx))}
                      className="p-1 hover:bg-slate-800 text-red-400 hover:text-red-300 rounded"
                      title="Remove Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Category Title</label>
                    <input 
                      type="text" 
                      value={skill.category}
                      onChange={(e) => dispatch(updateSkill({ index: idx, fields: { category: e.target.value } }))}
                      placeholder="e.g. Programming Languages"
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Skills List (comma-separated)</label>
                    <input 
                      type="text" 
                      value={skill.list}
                      onChange={(e) => dispatch(updateSkill({ index: idx, fields: { list: e.target.value } }))}
                      placeholder="e.g. Javascript, React, Python"
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => dispatch(addSkill())}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:text-slate-100 text-slate-300 text-xs font-bold transition-all"
            >
              <Plus size={14} />
              Add Skill Category
            </button>
          </div>
        )}
      </div>

      {/* 5. EDUCATION SECTION */}
      <div className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
        activeSection === 'education' ? 'border-indigo-500/50 shadow-lg' : 'border-slate-800'
      }`}>
        <button 
          onClick={() => toggleSection('education')}
          className="w-full flex items-center justify-between p-4 bg-slate-900/60 font-semibold text-sm text-left hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-indigo-400">
            <GraduationCap size={16} />
            Education
          </span>
          <span className="text-slate-400">{activeSection === 'education' ? '▼' : '▶'}</span>
        </button>

        {activeSection === 'education' && (
          <div className="p-4 border-t border-slate-850 space-y-4">
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                    <span className="text-xs font-bold text-slate-400">School #{idx + 1}</span>
                    <button 
                      onClick={() => dispatch(deleteEducation(idx))}
                      className="p-1 hover:bg-slate-800 text-red-400 hover:text-red-300 rounded"
                      title="Remove School"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Degree / Major</label>
                      <input 
                        type="text" 
                        value={edu.degree}
                        onChange={(e) => dispatch(updateEducation({ index: idx, fields: { degree: e.target.value } }))}
                        placeholder="e.g. B.S. in Computer Science"
                        className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">School / University</label>
                      <input 
                        type="text" 
                        value={edu.school}
                        onChange={(e) => dispatch(updateEducation({ index: idx, fields: { school: e.target.value } }))}
                        placeholder="e.g. UC Berkeley"
                        className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Location</label>
                      <input 
                        type="text" 
                        value={edu.location}
                        onChange={(e) => dispatch(updateEducation({ index: idx, fields: { location: e.target.value } }))}
                        placeholder="e.g. Berkeley, CA"
                        className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Graduation Date</label>
                      <input 
                        type="text" 
                        value={edu.date}
                        onChange={(e) => dispatch(updateEducation({ index: idx, fields: { date: e.target.value } }))}
                        placeholder="e.g. May 2020"
                        className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Additional details</label>
                    <textarea 
                      rows={2}
                      value={edu.description}
                      onChange={(e) => dispatch(updateEducation({ index: idx, fields: { description: e.target.value } }))}
                      placeholder="e.g. GPA 3.9/4.0, Honors"
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => dispatch(addEducation())}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:text-slate-100 text-slate-300 text-xs font-bold transition-all"
            >
              <Plus size={14} />
              Add Education
            </button>
          </div>
        )}
      </div>

      {/* 6. PROJECTS SECTION */}
      <div className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
        activeSection === 'projects' ? 'border-indigo-500/50 shadow-lg' : 'border-slate-800'
      }`}>
        <button 
          onClick={() => toggleSection('projects')}
          className="w-full flex items-center justify-between p-4 bg-slate-900/60 font-semibold text-sm text-left hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-indigo-400">
            <FolderGit size={16} />
            Projects
          </span>
          <span className="text-slate-400">{activeSection === 'projects' ? '▼' : '▶'}</span>
        </button>

        {activeSection === 'projects' && (
          <div className="p-4 border-t border-slate-850 space-y-4">
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                    <span className="text-xs font-bold text-slate-400">Project #{idx + 1}</span>
                    <button 
                      onClick={() => dispatch(deleteProject(idx))}
                      className="p-1 hover:bg-slate-800 text-red-400 hover:text-red-300 rounded"
                      title="Remove Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Project Title</label>
                      <input 
                        type="text" 
                        value={proj.title}
                        onChange={(e) => dispatch(updateProject({ index: idx, fields: { title: e.target.value } }))}
                        placeholder="e.g. Task Planner"
                        className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">My Role / Contributor</label>
                      <input 
                        type="text" 
                        value={proj.role}
                        onChange={(e) => dispatch(updateProject({ index: idx, fields: { role: e.target.value } }))}
                        placeholder="e.g. Lead Developer"
                        className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Project URL</label>
                    <input 
                      type="text" 
                      value={proj.link}
                      onChange={(e) => dispatch(updateProject({ index: idx, fields: { link: e.target.value } }))}
                      placeholder="e.g. github.com/user/project"
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Description</label>
                    <textarea 
                      rows={3}
                      value={proj.description}
                      onChange={(e) => dispatch(updateProject({ index: idx, fields: { description: e.target.value } }))}
                      placeholder="- Built web app using React and Tailwind"
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => dispatch(addProject())}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:text-slate-100 text-slate-300 text-xs font-bold transition-all"
            >
              <Plus size={14} />
              Add Project
            </button>
          </div>
        )}
      </div>

      {/* 7. CUSTOM SECTIONS */}
      <div className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
        activeSection === 'custom' ? 'border-indigo-500/50 shadow-lg' : 'border-slate-800'
      }`}>
        <button 
          onClick={() => toggleSection('custom')}
          className="w-full flex items-center justify-between p-4 bg-slate-900/60 font-semibold text-sm text-left hover:bg-slate-800/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-indigo-400">
            <FolderPlus size={16} />
            Custom Sections
          </span>
          <span className="text-slate-400">{activeSection === 'custom' ? '▼' : '▶'}</span>
        </button>

        {activeSection === 'custom' && (
          <div className="p-4 border-t border-slate-850 space-y-4">
            <div className="space-y-4">
              {custom.map((sec, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                    <span className="text-xs font-bold text-slate-400">Custom Section #{idx + 1}</span>
                    <button 
                      onClick={() => dispatch(deleteCustomSection(idx))}
                      className="p-1 hover:bg-slate-800 text-red-400 hover:text-red-300 rounded"
                      title="Remove Section"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Section Title</label>
                    <input 
                      type="text" 
                      value={sec.title}
                      onChange={(e) => dispatch(updateCustomSection({ index: idx, fields: { title: e.target.value } }))}
                      placeholder="e.g. Certifications"
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Content</label>
                    <textarea 
                      rows={3}
                      value={sec.content}
                      onChange={(e) => dispatch(updateCustomSection({ index: idx, fields: { content: e.target.value } }))}
                      placeholder="- Certification detail"
                      className="w-full bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => dispatch(addCustomSection())}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:text-slate-100 text-slate-300 text-xs font-bold transition-all"
            >
              <Plus size={14} />
              Add Custom Section
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { FileText, Sparkles, Loader2, Download, Plus, Trash2 } from 'lucide-react';

interface Education {
  degree: string;
  institution: string;
  year: string;
  cgpa: string;
}

export default function ResumeBuilder() {
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState<Education[]>([
    { degree: '', institution: '', year: '', cgpa: '' },
  ]);
  const [generating, setGenerating] = useState(false);
  const [resume, setResume] = useState<any>(null);

  const addEducation = () => setEducation([...education, { degree: '', institution: '', year: '', cgpa: '' }]);
  const removeEducation = (i: number) => setEducation(education.filter((_, idx) => idx !== i));
  const updateEducation = (i: number, field: keyof Education, value: string) => {
    const copy = [...education];
    copy[i][field] = value;
    setEducation(copy);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await apiClient.post('/resume/generate', {
        contact_info: { phone, linkedin, github, location },
        education,
      });
      setResume(res.data);
      toast.success('Resume generated!');
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error('Resume Builder is a Premium feature. Upgrade to unlock.');
      } else {
        toast.error('Could not generate resume.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!resume) return;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text('Resume', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`${phone} | ${location} | ${linkedin} | ${github}`, 20, y);
    y += 12;

    doc.setFontSize(13);
    doc.text('Summary', 20, y);
    y += 6;
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(resume.ai_generated_summary, 170);
    doc.text(summaryLines, 20, y);
    y += summaryLines.length * 5 + 8;

    doc.setFontSize(13);
    doc.text('Education', 20, y);
    y += 6;
    doc.setFontSize(10);
    education.forEach((edu) => {
      doc.text(`${edu.degree} — ${edu.institution} (${edu.year}) CGPA: ${edu.cgpa}`, 20, y);
      y += 6;
    });
    y += 6;

    doc.setFontSize(13);
    doc.text('Skills', 20, y);
    y += 6;
    doc.setFontSize(10);
    const skillsLine = doc.splitTextToSize(resume.ai_generated_skills.join(' • '), 170);
    doc.text(skillsLine, 20, y);
    y += skillsLine.length * 5 + 8;

    doc.setFontSize(13);
    doc.text('Achievements', 20, y);
    y += 6;
    doc.setFontSize(10);
    resume.ai_generated_achievements.forEach((a: string) => {
      const lines = doc.splitTextToSize(`• ${a}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 2;
    });

    doc.save('resume.pdf');
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold">AI Resume Builder</h1>
          </div>
          <p className="text-gray-400 mb-8">
            Auto-generated from your actual platform performance — no fabricated claims.
          </p>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm" />
              <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)}
                className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm" />
              <input placeholder="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm" />
              <input placeholder="GitHub URL" value={github} onChange={(e) => setGithub(e.target.value)}
                className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-300">Education</p>
                <button onClick={addEducation} className="text-primary text-xs flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              {education.map((edu, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                  <input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                    className="px-2 py-1.5 bg-dark-bg border border-dark-border rounded text-xs" />
                  <input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                    className="px-2 py-1.5 bg-dark-bg border border-dark-border rounded text-xs" />
                  <input placeholder="Year" value={edu.year} onChange={(e) => updateEducation(i, 'year', e.target.value)}
                    className="px-2 py-1.5 bg-dark-bg border border-dark-border rounded text-xs" />
                  <div className="flex gap-1">
                    <input placeholder="CGPA" value={edu.cgpa} onChange={(e) => updateEducation(i, 'cgpa', e.target.value)}
                      className="px-2 py-1.5 bg-dark-bg border border-dark-border rounded text-xs flex-1" />
                    {education.length > 1 && (
                      <button onClick={() => removeEducation(i)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white font-medium px-5 py-2.5 rounded-lg transition-all disabled:opacity-60"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Resume with AI
            </motion.button>
          </div>

          {resume && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold">Preview</p>
                <button onClick={downloadPDF} className="flex items-center gap-1.5 text-sm bg-primary hover:bg-primary-dark px-3 py-1.5 rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
              <p className="text-sm text-gray-300 mb-4">{resume.ai_generated_summary}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {resume.ai_generated_skills.map((s: string) => (
                  <span key={s} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{s}</span>
                ))}
              </div>
              <ul className="space-y-1.5 text-sm text-gray-300 list-disc list-inside">
                {resume.ai_generated_achievements.map((a: string, i: number) => <li key={i}>{a}</li>)}
              </ul>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
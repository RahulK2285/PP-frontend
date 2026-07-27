import fs from 'fs';
import path from 'path';

// ─── Resume Scoring Engine ───
// Analyzes resume text content and gives a detailed score

interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  status: 'good' | 'warning' | 'bad';
}

export interface ResumeScoreResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  categories: ScoreCategory[];
  tips: string[];
}

// Keywords that indicate strong resumes
const TECH_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'swift', 'kotlin',
  'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring',
  'mongodb', 'postgresql', 'mysql', 'redis', 'firebase', 'dynamodb',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'github actions',
  'html', 'css', 'tailwind', 'sass', 'bootstrap',
  'git', 'linux', 'rest api', 'graphql', 'microservices',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch',
  'data structures', 'algorithms', 'system design', 'agile', 'scrum',
];

const ACTION_VERBS = [
  'developed', 'built', 'designed', 'implemented', 'created', 'launched', 'deployed',
  'managed', 'led', 'coordinated', 'organized', 'optimized', 'improved', 'increased',
  'reduced', 'achieved', 'delivered', 'engineered', 'architected', 'automated',
  'analyzed', 'resolved', 'collaborated', 'mentored', 'trained', 'presented',
  'integrated', 'migrated', 'refactored', 'streamlined', 'spearheaded',
];

const SECTION_HEADERS = {
  contact: ['email', 'phone', 'linkedin', 'github', 'portfolio', 'website', 'address', 'contact'],
  summary: ['summary', 'objective', 'about', 'profile', 'introduction'],
  education: ['education', 'university', 'college', 'degree', 'bachelor', 'master', 'b.tech', 'm.tech', 'b.e', 'bsc', 'msc', 'phd', 'cgpa', 'gpa'],
  experience: ['experience', 'work experience', 'employment', 'internship', 'intern', 'work history', 'professional experience'],
  skills: ['skills', 'technical skills', 'technologies', 'tools', 'competencies', 'proficiencies', 'tech stack'],
  projects: ['projects', 'personal projects', 'academic projects', 'key projects', 'side projects'],
  certifications: ['certification', 'certifications', 'courses', 'training', 'licenses'],
  achievements: ['achievements', 'awards', 'honors', 'accomplishments', 'recognition'],
};

async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // pdf-parse is CJS-only, use require (works in compiled CJS output and tsx dev)
    // @ts-ignore - dynamic require for CJS module
    const pdfParse = typeof require !== 'undefined' ? require('pdf-parse') : (await import('pdf-parse')).default;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF parse error:', error);
    return '';
  }
}

async function extractText(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(filePath);
  }
  // For DOC/DOCX, we can't easily parse without heavy libraries
  // Return empty and give partial score
  return '';
}

function scoreResume(text: string, mimeType: string): ResumeScoreResult {
  const lowerText = text.toLowerCase();
  const categories: ScoreCategory[] = [];
  const tips: string[] = [];

  const isTextExtracted = text.length > 50;

  // ── 1. Contact Information (15 points) ──
  let contactScore = 0;
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text) || /\d{10}/.test(text);
  const hasLinkedin = lowerText.includes('linkedin');
  const hasGithub = lowerText.includes('github');
  const hasPortfolio = lowerText.includes('portfolio') || lowerText.includes('website') || /https?:\/\/(?!linkedin|github)[\w.-]+/.test(text);

  if (hasEmail) contactScore += 4;
  else tips.push('Add your email address for recruiters to contact you');

  if (hasPhone) contactScore += 3;
  else tips.push('Include a phone number for direct communication');

  if (hasLinkedin) contactScore += 3;
  else tips.push('Add your LinkedIn profile link');

  if (hasGithub) contactScore += 3;
  else tips.push('Include your GitHub profile to showcase your code');

  if (hasPortfolio) contactScore += 2;

  categories.push({
    name: 'Contact Information',
    score: contactScore,
    maxScore: 15,
    feedback: contactScore >= 10 ? 'Good contact details' : contactScore >= 6 ? 'Add more contact links' : 'Missing essential contact info',
    status: contactScore >= 10 ? 'good' : contactScore >= 6 ? 'warning' : 'bad',
  });

  // ── 2. Professional Summary / Objective (10 points) ──
  let summaryScore = 0;
  const hasSummary = SECTION_HEADERS.summary.some(k => lowerText.includes(k));
  if (hasSummary) {
    summaryScore += 5;
    // Check if it's substantial (at least 30 characters after the header)
    const summaryIdx = lowerText.indexOf('summary') !== -1 ? lowerText.indexOf('summary') : lowerText.indexOf('objective');
    if (summaryIdx !== -1) {
      const afterSummary = text.substring(summaryIdx, summaryIdx + 500);
      if (afterSummary.length > 100) summaryScore += 3;
      if (afterSummary.length > 200) summaryScore += 2;
    }
  } else {
    tips.push('Add a professional summary or objective at the top of your resume');
  }

  categories.push({
    name: 'Summary / Objective',
    score: summaryScore,
    maxScore: 10,
    feedback: summaryScore >= 7 ? 'Strong summary section' : summaryScore >= 4 ? 'Summary could be more detailed' : 'No summary section found',
    status: summaryScore >= 7 ? 'good' : summaryScore >= 4 ? 'warning' : 'bad',
  });

  // ── 3. Education (10 points) ──
  let educationScore = 0;
  const hasEducation = SECTION_HEADERS.education.some(k => lowerText.includes(k));
  if (hasEducation) {
    educationScore += 4;
    if (/\d{4}/.test(text)) educationScore += 2; // Has graduation year
    if (/cgpa|gpa|percentage|%/.test(lowerText)) educationScore += 2; // Has GPA
    if (/b\.?tech|m\.?tech|bachelor|master|b\.?e|b\.?sc|m\.?sc/.test(lowerText)) educationScore += 2; // Has degree name
  } else {
    tips.push('Include your education background with degree, university, and graduation year');
  }

  categories.push({
    name: 'Education',
    score: educationScore,
    maxScore: 10,
    feedback: educationScore >= 7 ? 'Solid education section' : educationScore >= 4 ? 'Add more education details' : 'Education section missing or incomplete',
    status: educationScore >= 7 ? 'good' : educationScore >= 4 ? 'warning' : 'bad',
  });

  // ── 4. Work Experience (15 points) ──
  let experienceScore = 0;
  const hasExperience = SECTION_HEADERS.experience.some(k => lowerText.includes(k));
  if (hasExperience) {
    experienceScore += 4;
    // Check for company names / dates
    if (/\d{4}\s*[-–]\s*(\d{4}|present|current)/i.test(text)) experienceScore += 3;
    // Check for action verbs
    const actionVerbCount = ACTION_VERBS.filter(v => lowerText.includes(v)).length;
    if (actionVerbCount >= 5) experienceScore += 4;
    else if (actionVerbCount >= 3) experienceScore += 3;
    else if (actionVerbCount >= 1) experienceScore += 2;
    // Check for quantifiable results
    const hasNumbers = /\d+%|\d+x|\$[\d,]+|saved|increased|reduced|improved\s+\w+\s+by/.test(lowerText);
    if (hasNumbers) experienceScore += 4;
    else tips.push('Add quantifiable achievements (e.g., "Increased performance by 40%")');
  } else {
    tips.push('Add work experience or internship details with bullet points');
  }

  categories.push({
    name: 'Work Experience',
    score: experienceScore,
    maxScore: 15,
    feedback: experienceScore >= 11 ? 'Excellent experience section' : experienceScore >= 6 ? 'Good but can be improved' : 'Needs more experience details',
    status: experienceScore >= 11 ? 'good' : experienceScore >= 6 ? 'warning' : 'bad',
  });

  // ── 5. Technical Skills (15 points) ──
  let skillsScore = 0;
  const hasSkills = SECTION_HEADERS.skills.some(k => lowerText.includes(k));
  const techKeywordsFound = TECH_KEYWORDS.filter(k => lowerText.includes(k));

  if (hasSkills) skillsScore += 3;
  if (techKeywordsFound.length >= 10) skillsScore += 6;
  else if (techKeywordsFound.length >= 6) skillsScore += 5;
  else if (techKeywordsFound.length >= 3) skillsScore += 3;
  else if (techKeywordsFound.length >= 1) skillsScore += 2;

  // Bonus for organized skills section
  if (techKeywordsFound.length >= 5 && hasSkills) skillsScore += 3;
  // Bonus for diverse skillset
  const hasLanguage = techKeywordsFound.some(k => ['javascript', 'typescript', 'python', 'java', 'c++', 'go'].includes(k));
  const hasFramework = techKeywordsFound.some(k => ['react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django'].includes(k));
  const hasDatabase = techKeywordsFound.some(k => ['mongodb', 'postgresql', 'mysql', 'redis', 'firebase'].includes(k));
  if (hasLanguage && hasFramework && hasDatabase) skillsScore += 3;

  skillsScore = Math.min(skillsScore, 15);

  if (techKeywordsFound.length < 5) {
    tips.push('List more technical skills — languages, frameworks, databases, and tools');
  }

  categories.push({
    name: 'Technical Skills',
    score: skillsScore,
    maxScore: 15,
    feedback: skillsScore >= 11 ? 'Strong and diverse skill set' : skillsScore >= 6 ? 'Good skills, consider adding more' : 'Needs a dedicated skills section',
    status: skillsScore >= 11 ? 'good' : skillsScore >= 6 ? 'warning' : 'bad',
  });

  // ── 6. Projects (15 points) ──
  let projectsScore = 0;
  const hasProjects = SECTION_HEADERS.projects.some(k => lowerText.includes(k));
  if (hasProjects) {
    projectsScore += 5;
    // Check for project descriptions with tech used
    if (techKeywordsFound.length >= 3) projectsScore += 3;
    // Check for links (GitHub repos, live demos)
    const hasLinks = /github\.com\/\w|https?:\/\/[\w.-]+(\/[\w.-]*)+/.test(text);
    if (hasLinks) projectsScore += 4;
    else tips.push('Add live demo or GitHub links for your projects');
    // Check for descriptions
    if (text.length > 500) projectsScore += 3;
  } else {
    tips.push('Add a projects section showcasing what you\'ve built');
  }

  categories.push({
    name: 'Projects',
    score: projectsScore,
    maxScore: 15,
    feedback: projectsScore >= 11 ? 'Great project showcase' : projectsScore >= 5 ? 'Good projects, add more details' : 'Add projects to stand out',
    status: projectsScore >= 11 ? 'good' : projectsScore >= 5 ? 'warning' : 'bad',
  });

  // ── 7. Formatting & Length (10 points) ──
  let formatScore = 0;
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  // Ideal resume is 300-800 words (1-2 pages)
  if (wordCount >= 200 && wordCount <= 1200) {
    formatScore += 4;
  } else if (wordCount >= 100) {
    formatScore += 2;
    if (wordCount > 1200) tips.push('Your resume may be too long — try to keep it to 1-2 pages');
    else tips.push('Your resume seems short — add more details about your experience and projects');
  } else {
    if (isTextExtracted) tips.push('Resume content is very thin — aim for at least 1 full page');
  }

  // Check for consistent formatting (bullet points, etc.)
  const hasBullets = /[•·▪►–-]\s/.test(text) || /^\s*[-*]\s/m.test(text);
  if (hasBullets) formatScore += 3;
  else tips.push('Use bullet points to organize your experience and achievements');

  // Check for section separation
  const sectionCount = Object.values(SECTION_HEADERS).flat().filter(k => lowerText.includes(k)).length;
  if (sectionCount >= 4) formatScore += 3;
  else if (sectionCount >= 2) formatScore += 1;

  categories.push({
    name: 'Formatting & Structure',
    score: formatScore,
    maxScore: 10,
    feedback: formatScore >= 7 ? 'Well structured' : formatScore >= 4 ? 'Decent structure' : 'Improve formatting and structure',
    status: formatScore >= 7 ? 'good' : formatScore >= 4 ? 'warning' : 'bad',
  });

  // ── 8. Extras (10 points) ──
  let extrasScore = 0;
  const hasCerts = SECTION_HEADERS.certifications.some(k => lowerText.includes(k));
  const hasAchievements = SECTION_HEADERS.achievements.some(k => lowerText.includes(k));
  const hasExtracurricular = lowerText.includes('volunteer') || lowerText.includes('leadership') || lowerText.includes('club') || lowerText.includes('open source');

  if (hasCerts) { extrasScore += 3; } else { tips.push('Add certifications (AWS, Google, Coursera, etc.) to boost credibility'); }
  if (hasAchievements) { extrasScore += 4; }
  if (hasExtracurricular) { extrasScore += 3; }

  categories.push({
    name: 'Certifications & Extras',
    score: extrasScore,
    maxScore: 10,
    feedback: extrasScore >= 7 ? 'Great extras' : extrasScore >= 3 ? 'Some extras present' : 'Add certifications or achievements',
    status: extrasScore >= 7 ? 'good' : extrasScore >= 3 ? 'warning' : 'bad',
  });

  // ── Handle non-PDF case ──
  if (!isTextExtracted && mimeType !== 'application/pdf') {
    // Can't extract text from DOC/DOCX without heavy dependencies
    // Give a base score and note the limitation
    tips.length = 0;
    tips.push('Upload a PDF version for detailed scoring — DOC/DOCX text extraction is limited');
    tips.push('PDF resumes generally perform better with ATS (Applicant Tracking Systems)');

    return {
      totalScore: 0,
      maxScore: 100,
      percentage: 0,
      grade: 'N/A',
      categories: categories.map(c => ({ ...c, score: 0, feedback: 'Upload PDF for analysis', status: 'warning' as const })),
      tips,
    };
  }

  // ── Calculate Total ──
  const totalScore = categories.reduce((sum, c) => sum + c.score, 0);
  const maxScore = categories.reduce((sum, c) => sum + c.maxScore, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  let grade: string;
  if (percentage >= 85) grade = 'A+';
  else if (percentage >= 75) grade = 'A';
  else if (percentage >= 65) grade = 'B+';
  else if (percentage >= 55) grade = 'B';
  else if (percentage >= 45) grade = 'C+';
  else if (percentage >= 35) grade = 'C';
  else grade = 'D';

  // Only keep top 5 most useful tips
  const finalTips = tips.slice(0, 6);

  return {
    totalScore,
    maxScore,
    percentage,
    grade,
    categories,
    tips: finalTips,
  };
}

export async function analyzeResume(filePath: string, mimeType: string): Promise<ResumeScoreResult> {
  const text = await extractText(filePath, mimeType);
  return scoreResume(text, mimeType);
}

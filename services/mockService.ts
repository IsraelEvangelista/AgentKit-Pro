import { Skill, SkillStatus, ScrapeResult, LogEntry } from '../types';

// Mock Data Store
let MOCK_SKILLS: Skill[] = [
  {
    id: 'sk-8492',
    title: 'Advanced React Patterns',
    description: 'Master advanced React patterns including Compound Components, Control Props, and Custom Hooks to elevate your architecture.',
    category: 'Frontend Dev',
    url: 'https://skillsmp.com/skill/react-patterns',
    storageUrl: 'https://supabase.co/storage/v1/object/public/skills/react-patterns.zip',
    dateAdded: '2023-10-12',
    level: 'Senior',
    status: SkillStatus.PENDING,
    tags: ['React', 'Hooks', 'Architecture']
  },
  {
    id: 'sk-9921',
    title: 'PostgreSQL Scaling',
    description: 'Deep dive into partitioning, advanced indexing, and query optimization for high-scale databases.',
    category: 'Backend',
    url: 'https://skillsmp.com/skill/postgres-scale',
    storageUrl: 'https://supabase.co/storage/v1/object/public/skills/postgres-scale.zip',
    dateAdded: '2023-09-01',
    level: 'Expert',
    status: SkillStatus.PAUSED,
    tags: ['SQL', 'Database', 'Performance']
  },
  {
    id: 'sk-1029',
    title: 'UI/UX Principles v2',
    description: 'Foundations of interface design, usability heuristics, and high-fidelity prototyping.',
    category: 'Design',
    url: 'https://skillsmp.com/skill/ui-ux-v2',
    storageUrl: 'https://supabase.co/storage/v1/object/public/skills/ui-ux.zip',
    dateAdded: '2023-08-25',
    level: 'Pleno',
    status: SkillStatus.COMPLETED,
    tags: ['Figma', 'Prototyping', 'Theory']
  }
];

export const getSkills = async (): Promise<Skill[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...MOCK_SKILLS]), 600);
  });
};

export const deleteSkill = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      MOCK_SKILLS = MOCK_SKILLS.filter(s => s.id !== id);
      resolve();
    }, 400);
  });
};

export const simulateScrape = async (url: string, onLog: (log: LogEntry) => void): Promise<ScrapeResult> => {
  const addLog = (msg: string, type: LogEntry['type'] = 'info') => {
    onLog({
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: msg,
      type
    });
  };

  addLog('Initializing scraping module...');
  await new Promise(r => setTimeout(r, 800));
  
  addLog(`Connecting to target host ${url.substring(0, 25)}... OK (200)`);
  await new Promise(r => setTimeout(r, 600));

  addLog('Bypassing Cloudflare protection...', 'warning');
  await new Promise(r => setTimeout(r, 1200));

  addLog('Extracting page metadata and schema...');
  await new Promise(r => setTimeout(r, 500));

  addLog('Target identified: "System Architecture & Design Patterns"', 'success');
  addLog('Generating category suggestions via Neural Engine...');
  await new Promise(r => setTimeout(r, 800));

  return {
    title: 'System Architecture & Design Patterns',
    description: 'A comprehensive guide to designing scalable software systems using modern patterns and microservices.',
    downloadUrl: 'https://cdn.skillsmp.com/downloads/secure/sys-arch-v4.zip',
    tags: ['Architecture', 'Microservices', 'System Design'],
    latency: 124
  };
};

export const saveSkillToSupabase = async (scrapeResult: ScrapeResult, category: string): Promise<Skill> => {
    // Simulate upload
    const newSkill: Skill = {
        id: `sk-${Math.floor(Math.random() * 10000)}`,
        title: scrapeResult.title,
        description: scrapeResult.description,
        category: category,
        url: 'https://skillsmp.com/simulated',
        storageUrl: 'https://supa.storage/simulated-file.zip',
        dateAdded: new Date().toISOString().split('T')[0],
        level: 'Pleno',
        status: SkillStatus.ACTIVE,
        tags: scrapeResult.tags
    };

    MOCK_SKILLS.unshift(newSkill); // Add to local store
    return new Promise(r => setTimeout(() => r(newSkill), 1500));
};

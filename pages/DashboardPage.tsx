import React, { useState, useEffect } from 'react';
import { Search, Filter, Command, Plus } from 'lucide-react';
import SkillCard from '../components/SkillCard';
import SkillDetailModal from '../components/SkillDetailModal';
import { Skill } from '../types';
import { deleteSkillNode, getStoredSkills } from '../services/skillsService';
import { User } from '../types';

interface DashboardProps {
  onNavigate: (page: string) => void;
  user?: User | null;
}

const DashboardPage: React.FC<DashboardProps> = ({ onNavigate, user }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal State
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    if (user?.id) loadSkills();
  }, [user?.id]);

  const loadSkills = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getStoredSkills(user.id);
      setSkills(data);
    } catch (e) {
      console.error("Failed to load skills", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('WARNING: Confirm deletion of this skill node? This action cannot be undone.')) {
      const skillToDelete = skills.find((s) => s.id === id);
      if (!skillToDelete) return;
      try {
        await deleteSkillNode(skillToDelete);
        await loadSkills();
      } catch (e) {
        console.error('Failed to delete skill', e);
      }
    }
  };

  const handleView = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const filteredSkills = skills.filter(skill =>
    (skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     skill.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === 'All' || skill.category === filterCategory)
  );

  // Get unique categories from skills for filter dropdown
  const categories = ['All', ...Array.from(new Set(skills.map(s => s.category)))];

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Modal */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}

      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">SKILL DATABASE</h2>
        <p className="text-gray-400 max-w-2xl">Manage your learning progress and catalog new technological competencies in the neural network.</p>
        <div className="h-px w-full bg-gradient-to-r from-cyber-border via-transparent to-transparent mt-4"></div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-cyan transition-colors" size={20} />
          <input
            type="text"
            placeholder="QUERY DATABASE... (Search by name or tag)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cyber-panel border border-cyber-border rounded-lg py-3 pl-12 pr-24 text-white focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan outline-none transition-all placeholder-gray-600 font-mono"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-cyber-border rounded text-[10px] text-gray-400 font-mono border border-gray-700">
            CMD + K
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-cyber-blue font-mono text-xs uppercase tracking-wider mr-2">Filters:</span>

          <div className="relative">
            <select
              className="appearance-none bg-cyber-panel border border-cyber-border rounded px-4 py-2 pr-8 text-white focus:border-cyber-blue outline-none cursor-pointer"
              onChange={(e) => setFilterCategory(e.target.value)}
              value={filterCategory}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'Category: All' : cat}</option>
              ))}
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <div className="ml-auto">
            <button
              onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-xs uppercase font-mono">Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid - Responsive with more columns */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-lg bg-cyber-panel/50 border border-cyber-border animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredSkills.map(skill => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}

          {/* Add New Card */}
          <button
            onClick={() => onNavigate('catalog')}
            className="border-2 border-dashed border-cyber-border rounded-lg flex flex-col items-center justify-center p-6 text-gray-500 hover:border-cyber-blue hover:text-cyber-blue hover:bg-cyber-blue/5 transition-all group min-h-[280px]"
          >
            <div className="w-14 h-14 rounded-full bg-cyber-panel flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus size={28} />
            </div>
            <h3 className="text-base font-bold mb-1">Add New Node</h3>
            <p className="text-xs text-center max-w-[180px]">Register a new skill to begin tracking progress.</p>
          </button>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredSkills.length > 0 && (
        <div className="flex items-center justify-between border-t border-cyber-border pt-4 mt-8">
          <p className="text-xs font-mono text-gray-500 uppercase">Showing {filteredSkills.length} of {skills.length} Records</p>
          <div className="flex space-x-2">
            <button className="w-8 h-8 flex items-center justify-center border border-cyber-border rounded hover:bg-cyber-border text-gray-400 transition-colors">{'<'}</button>
            <button className="w-8 h-8 flex items-center justify-center bg-cyber-blue text-white rounded font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-cyber-border rounded hover:bg-cyber-border text-gray-400 transition-colors">2</button>
            <span className="w-8 h-8 flex items-center justify-center text-gray-600">...</span>
            <button className="w-8 h-8 flex items-center justify-center border border-cyber-border rounded hover:bg-cyber-border text-gray-400 transition-colors">{'>'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

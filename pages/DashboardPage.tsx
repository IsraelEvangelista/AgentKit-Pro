import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, Command, Plus } from 'lucide-react';
import SkillCard from '../components/SkillCard';
import SkillDetailModal from '../components/SkillDetailModal';
import { Skill } from '../types';
import { getStoredSkills, deleteSkill as apiDeleteSkill } from '../services/skillsService'; // Switch to real service
import { User } from '../types';

interface DashboardProps {
    onNavigate: (page: string) => void;
    user?: User | null; // Receive user prop
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
    // Only implemented in frontend for now, need backend delete
    if (window.confirm('WARNING: Confirm deletion of this skill node? This action cannot be undone.')) {
         // await apiDeleteSkill(id); 
         setSkills(skills.filter(s => s.id !== id));
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

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Modal */}
      {selectedSkill && (
          <SkillDetailModal 
              skill={selectedSkill} 
              onClose={() => setSelectedSkill(null)} 
          />
      )}

      {/* Header Section */}
      <div>
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">SKILL DATABASE</h2>
        <p className="text-gray-400 max-w-2xl">Manage your learning progress and catalog new technological competencies in the neural network.</p>
        <div className="h-px w-full bg-gradient-to-r from-cyber-border via-transparent to-transparent mt-6"></div>
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
                className="w-full bg-cyber-panel border border-cyber-border rounded-lg py-4 pl-12 pr-24 text-white focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan outline-none transition-all placeholder-gray-600 font-mono"
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
                >
                    <option value="All">Status: All</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>

            <div className="relative">
                <select 
                    className="appearance-none bg-cyber-panel border border-cyber-border rounded px-4 py-2 pr-8 text-white focus:border-cyber-blue outline-none cursor-pointer"
                >
                    <option>Category: All</option>
                    <option>Frontend</option>
                    <option>Backend</option>
                    <option>Design</option>
                </select>
                <Command size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>

            <div className="ml-auto">
                <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <span className="text-xs uppercase font-mono">Reset Filters</span>
                </button>
            </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-lg bg-cyber-panel/50 border border-cyber-border animate-pulse"></div>
            ))}
         </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="border-2 border-dashed border-cyber-border rounded-lg flex flex-col items-center justify-center p-8 text-gray-500 hover:border-cyber-blue hover:text-cyber-blue hover:bg-cyber-blue/5 transition-all group min-h-[300px]"
            >
                <div className="w-16 h-16 rounded-full bg-cyber-panel flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus size={32} />
                </div>
                <h3 className="text-lg font-bold mb-1">Add New Node</h3>
                <p className="text-xs text-center max-w-[200px]">Register a new skill to begin tracking progress.</p>
            </button>
          </div>
      )}
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-cyber-border pt-6 mt-12">
        <p className="text-xs font-mono text-gray-500 uppercase">Showing {filteredSkills.length} of {skills.length} Records</p>
        <div className="flex space-x-2">
            <button className="w-8 h-8 flex items-center justify-center border border-cyber-border rounded hover:bg-cyber-border text-gray-400 transition-colors">{'<'}</button>
            <button className="w-8 h-8 flex items-center justify-center bg-cyber-blue text-white rounded font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-cyber-border rounded hover:bg-cyber-border text-gray-400 transition-colors">2</button>
            <span className="w-8 h-8 flex items-center justify-center text-gray-600">...</span>
            <button className="w-8 h-8 flex items-center justify-center border border-cyber-border rounded hover:bg-cyber-border text-gray-400 transition-colors">{'>'}</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

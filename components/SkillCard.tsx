import React from 'react';
import { Calendar, Layers, Trash2, ArrowRight, PauseCircle, CheckCircle, Database } from 'lucide-react';
import { Skill, SkillStatus } from '../types';

interface SkillCardProps {
  skill: Skill;
  onDelete: (id: string) => void;
  onView: (skill: Skill) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onDelete, onView }) => {
  const getStatusColor = (status: SkillStatus) => {
    switch (status) {
      case SkillStatus.ACTIVE: return 'text-cyber-orange border-cyber-orange/30 bg-cyber-orange/10';
      case SkillStatus.COMPLETED: return 'text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/10';
      case SkillStatus.PAUSED: return 'text-cyber-muted border-cyber-muted/30 bg-cyber-muted/10';
      default: return 'text-cyber-blue border-cyber-blue/30 bg-cyber-blue/10';
    }
  };

  const getStatusIcon = (status: SkillStatus) => {
     switch (status) {
        case SkillStatus.ACTIVE: return <Database size={12} className="mr-1" />;
        case SkillStatus.COMPLETED: return <CheckCircle size={12} className="mr-1" />;
        case SkillStatus.PAUSED: return <PauseCircle size={12} className="mr-1" />;
        default: return <Layers size={12} className="mr-1" />;
     }
  }

  return (
    <div className="cyber-card p-5 rounded-lg flex flex-col h-full hover:border-cyber-blue/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-cyber-border rounded flex items-center justify-center text-cyber-text font-bold text-lg group-hover:text-cyber-blue group-hover:bg-cyber-blue/10 transition-colors">
            {skill.title.substring(0, 2).toUpperCase()}
        </div>
        <div className={`text-[10px] font-mono px-2 py-1 rounded border flex items-center ${getStatusColor(skill.status)}`}>
            {getStatusIcon(skill.status)}
            {skill.status.toUpperCase()}
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{skill.title}</h3>
      <p className="text-xs text-cyber-orange font-mono mb-3 uppercase tracking-wider">{skill.category}</p>
      
      <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-3 leading-relaxed">
        {skill.description}
      </p>

      <div className="border-t border-cyber-border pt-4 mt-auto">
        <div className="flex items-center space-x-4 mb-4 text-xs text-gray-500 font-mono">
            <div className="flex items-center">
                <Calendar size={12} className="mr-1" />
                {skill.dateAdded}
            </div>
            <div className="flex items-center">
                <Layers size={12} className="mr-1" />
                {skill.level}
            </div>
        </div>

        <div className="flex space-x-2">
            <button 
                onClick={() => onView(skill)}
                className="flex-1 bg-cyber-border hover:bg-cyber-blue/20 hover:text-cyber-blue hover:border-cyber-blue/50 border border-transparent text-white text-xs font-bold py-2 rounded transition-all flex items-center justify-center uppercase tracking-wide"
            >
                <span>View Details</span>
                <ArrowRight size={14} className="ml-1" />
            </button>
            <button 
                onClick={() => onDelete(skill.id)}
                className="w-9 flex items-center justify-center border border-cyber-border rounded hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all text-gray-500"
            >
                <Trash2 size={14} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;

import React, { useState, useEffect } from 'react';
import { X, Calendar, Database, FileText, Code, Loader2, FolderOpen, ChevronRight } from 'lucide-react';
import { Skill, SkillFile } from '../types';
import { getSkillFiles, getSkillFileContent } from '../services/skillsService';

interface SkillDetailModalProps {
  skill: Skill | null;
  onClose: () => void;
}

const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ skill, onClose }) => {
  const [files, setFiles] = useState<SkillFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SkillFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (skill) {
        loadFiles();
    }
  }, [skill]);

  const loadFiles = async () => {
      if (!skill) return;
      setLoadingFiles(true);
      try {
          const data = await getSkillFiles(skill.id);
          setFiles(data || []);
      } catch (e) {
          console.error("Failed to load files", e);
      } finally {
          setLoadingFiles(false);
      }
  };

  const handleFileSelect = async (file: SkillFile) => {
      setSelectedFile(file);
      setLoadingContent(true);
      setFileContent(''); // Reset
      
      try {
          const content = await getSkillFileContent(file.storage_path);
          setFileContent(content || 'Failed to load content or empty file.');
      } catch (e) {
          setFileContent('Error loading file content.');
      } finally {
          setLoadingContent(false);
      }
  };

  if (!skill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-[#0a0a0a] border border-cyber-border rounded-xl w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col relative overflow-hidden animate-fade-in-up">
        
        {/* Header - Fixed Height */}
        <div className="flex justify-between items-start p-6 border-b border-cyber-border/50 bg-[#0f0f0f]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-cyber-blue/10 text-cyber-blue px-2 py-1 rounded text-xs font-mono border border-cyber-blue/30 uppercase tracking-wider">
                {skill.category || 'Module'}
              </span>
              <span className="text-gray-500 text-xs font-mono flex items-center">
                 <Calendar size={12} className="mr-1"/> {new Date(skill.dateAdded).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{skill.title}</h2>
            <p className="text-gray-400 text-sm max-w-3xl line-clamp-2">{skill.description}</p>
            
            <div className="flex gap-2 mt-3">
                {skill.tags?.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-cyber-panel border border-cyber-border text-gray-400">
                        #{tag}
                    </span>
                ))}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-cyber-panel p-2 rounded-full hover:bg-red-500/20 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* Content Area - Split View */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Left Sidebar: File List */}
            <div className="w-1/3 border-r border-cyber-border/50 flex flex-col bg-[#050505]">
                <div className="p-3 border-b border-cyber-border/30 bg-cyber-panel/10 text-xs font-mono text-cyber-orange uppercase tracking-wider flex items-center">
                    <FolderOpen size={14} className="mr-2" /> Project Files
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {loadingFiles ? (
                        <div className="flex justify-center items-center h-20 text-cyber-blue"><Loader2 className="animate-spin" /></div>
                    ) : files.length === 0 ? (
                        <div className="text-gray-500 text-center py-10 text-xs italic">No extracted files found.<br/>(This skill might be from before the update)</div>
                    ) : (
                        files.map(file => (
                            <button 
                                key={file.id}
                                onClick={() => handleFileSelect(file)}
                                className={`w-full text-left px-3 py-2 rounded flex items-center text-xs font-mono transition-all truncate ${
                                    selectedFile?.id === file.id 
                                    ? 'bg-cyber-blue/10 text-cyber-cyan border border-cyber-blue/20' 
                                    : 'text-gray-400 hover:bg-cyber-panel hover:text-white'
                                }`}
                            >
                                <FileText size={12} className="mr-2 flex-shrink-0" />
                                <span className="truncate">{file.file_path}</span>
                            </button>
                        ))
                    )}
                </div>
                <div className="p-2 border-t border-cyber-border/30 text-[10px] text-gray-600 font-mono text-center">
                    {files.length} items
                </div>
            </div>

            {/* Right Pane: Code Viewer */}
            <div className="w-2/3 flex flex-col bg-[#0d0d0d] relative">
                <div className="p-3 border-b border-cyber-border/30 bg-cyber-panel/10 text-xs font-mono text-gray-400 flex items-center justify-between">
                    <div className="flex items-center">
                        <Code size={14} className="mr-2 text-cyber-blue" />
                        {selectedFile ? selectedFile.filename : 'No file selected'}
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar p-4 relative">
                    {loadingContent ? (
                         <div className="absolute inset-0 flex items-center justify-center text-cyber-blue bg-black/50 backdrop-blur-sm">
                             <Loader2 className="animate-spin mr-2" /> Loading content...
                         </div>
                    ) : selectedFile ? (
                        <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap font-code">
                            {fileContent}
                        </pre>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-20">
                            <Code size={64} className="mb-4" />
                            <p className="text-sm font-mono">Select a file to view content</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default SkillDetailModal;

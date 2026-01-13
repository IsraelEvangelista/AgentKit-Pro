import React, { useEffect, useMemo, useState } from 'react';
import { X, Calendar, FileText, Code, Loader2, FolderOpen, ChevronRight, Folder } from 'lucide-react';
import JSZip from 'jszip';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { Skill, SkillFile } from '../types';
import { getSkillFileContent, getSkillFiles, getSkillZipBlob } from '../services/skillsService';

interface SkillDetailModalProps {
  skill: Skill | null;
  onClose: () => void;
}

type TreeNodeType = 'file' | 'dir';

interface TreeNode {
  id: string;
  type: TreeNodeType;
  path: string;
  dirPath: string;
  name: string;
  ext: string | null;
  storagePath: string;
  zipInternalPath: string | null;
  contentType: string | null;
  sizeBytes: number | null;
}

const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ skill, onClose }) => {
  const [files, setFiles] = useState<SkillFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingZip, setLoadingZip] = useState(false);
  const [zip, setZip] = useState<JSZip | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({ '': true });

  useEffect(() => {
    if (skill) {
        loadFiles();
    }
  }, [skill]);

  const loadFiles = async () => {
      if (!skill) return;
      setLoadingFiles(true);
      setSelectedNode(null);
      setFileContent('');
      setIsMarkdown(false);
      if (fileBlobUrl) URL.revokeObjectURL(fileBlobUrl);
      setFileBlobUrl(null);
      setZip(null);
      try {
          const data = await getSkillFiles(skill.id);
          setFiles(data || []);
      } catch (e) {
          console.error("Failed to load files", e);
      } finally {
          setLoadingFiles(false);
      }
  };

  const nodes = useMemo<TreeNode[]>(() => {
    return (files || [])
      .map((f) => {
        const rawPath = f.path ?? f.file_path;
        const type: TreeNodeType =
          f.node_type === 'dir' || rawPath.endsWith('/') ? 'dir' : 'file';
        const path = type === 'dir' ? (rawPath.endsWith('/') ? rawPath : `${rawPath}/`) : rawPath;
        const dirPath = f.dir_path ?? '';
        const name = f.basename ?? f.filename;
        const ext = f.ext ?? null;
        return {
          id: f.id,
          type,
          path,
          dirPath,
          name,
          ext,
          storagePath: f.storage_path,
          zipInternalPath: f.zip_internal_path ?? null,
          contentType: f.content_type ?? null,
          sizeBytes: typeof f.size_bytes === 'number' ? f.size_bytes : null
        };
      })
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [files]);

  const childrenByDir = useMemo(() => {
    const map = new Map<string, TreeNode[]>();
    for (const n of nodes) {
      const key = n.dirPath ?? '';
      const list = map.get(key) ?? [];
      list.push(n);
      map.set(key, list);
    }
    for (const [key, list] of map.entries()) {
      const dirs = list.filter((n) => n.type === 'dir').sort((a, b) => a.name.localeCompare(b.name));
      const filesOnly = list.filter((n) => n.type === 'file').sort((a, b) => a.name.localeCompare(b.name));
      map.set(key, [...dirs, ...filesOnly]);
    }
    return map;
  }, [nodes]);

  const toggleDir = (dirPath: string) => {
    setExpandedDirs((prev) => ({ ...prev, [dirPath]: !prev[dirPath] }));
  };

  const isLikelyText = (node: TreeNode) => {
    if (node.ext === '.md') return true;
    if (node.contentType?.startsWith('text/')) return true;
    if (node.contentType === 'application/json') return true;
    if (node.contentType === 'application/javascript') return true;
    if (node.contentType === 'application/typescript') return true;
    return false;
  };

  const ensureZipLoaded = async (zipStoragePath: string) => {
    if (zip) return zip;
    setLoadingZip(true);
    try {
      const blob = await getSkillZipBlob(zipStoragePath);
      if (!blob) return null;
      const loaded = await JSZip.loadAsync(blob);
      setZip(loaded);
      return loaded;
    } finally {
      setLoadingZip(false);
    }
  };

  const handleNodeSelect = async (node: TreeNode) => {
    if (node.type !== 'file') return;
    setSelectedNode(node);
    setLoadingContent(true);
    setFileContent('');
    setIsMarkdown(false);
    if (fileBlobUrl) URL.revokeObjectURL(fileBlobUrl);
    setFileBlobUrl(null);

    const zipStoragePath = node.storagePath || skill?.storageUrl;
    if (!zipStoragePath) {
      setFileContent('ZIP não está associado a esta skill.');
      setLoadingContent(false);
      return;
    }

    const zipInternalPath = node.zipInternalPath;
    try {
      if (!zipInternalPath) {
        if (isLikelyText(node)) {
          const content = await getSkillFileContent(zipStoragePath);
          setIsMarkdown(node.ext === '.md');
          setFileContent(content || 'Falha ao carregar conteúdo ou arquivo vazio.');
        } else {
          const blob = await getSkillZipBlob(zipStoragePath);
          if (!blob) {
            setFileContent('Falha ao baixar arquivo.');
          } else {
            const url = URL.createObjectURL(blob);
            setFileBlobUrl(url);
            setFileContent('Preview de binário não suportado. Use download.');
          }
        }
        return;
      }

      const loadedZip = await ensureZipLoaded(zipStoragePath);
      if (!loadedZip) {
        setFileContent('Falha ao baixar ou abrir o ZIP.');
        return;
      }

      const zipFile = loadedZip.file(zipInternalPath);
      if (!zipFile) {
        setFileContent('Arquivo não encontrado dentro do ZIP.');
        return;
      }

      if (isLikelyText(node)) {
        const content = await zipFile.async('text');
        setIsMarkdown(node.ext === '.md');
        setFileContent(content);
      } else {
        const blob = await zipFile.async('blob');
        const url = URL.createObjectURL(blob);
        setFileBlobUrl(url);
        setFileContent('Preview de binário não suportado. Use download.');
      }
    } catch {
      setFileContent('Erro ao carregar conteúdo do arquivo.');
    } finally {
      setLoadingContent(false);
    }
  };

  if (!skill) return null;

  const renderTree = (dirPath: string, level: number) => {
    const children = childrenByDir.get(dirPath) ?? [];
    if (children.length === 0) return null;

    return (
      <div className="space-y-1">
        {children.map((node) => {
          const paddingLeft = 12 + level * 12;
          if (node.type === 'dir') {
            const expanded = expandedDirs[node.path] ?? false;
            return (
              <div key={node.id}>
                <button
                  onClick={() => toggleDir(node.path)}
                  className="w-full text-left px-3 py-2 rounded flex items-center text-xs font-mono transition-all truncate text-gray-300 hover:bg-cyber-panel hover:text-white"
                  style={{ paddingLeft }}
                >
                  <ChevronRight
                    size={12}
                    className={`mr-2 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
                  />
                  <Folder size={12} className="mr-2 flex-shrink-0 text-cyber-orange" />
                  <span className="truncate">{node.name}</span>
                </button>
                {expanded && (
                  <div className="mt-1">
                    {renderTree(node.path, level + 1)}
                  </div>
                )}
              </div>
            );
          }

          const isSelected = selectedNode?.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => handleNodeSelect(node)}
              className={`w-full text-left px-3 py-2 rounded flex items-center text-xs font-mono transition-all truncate ${
                isSelected
                  ? 'bg-cyber-blue/10 text-cyber-cyan border border-cyber-blue/20'
                  : 'text-gray-400 hover:bg-cyber-panel hover:text-white'
              }`}
              style={{ paddingLeft }}
            >
              <FileText size={12} className="mr-2 flex-shrink-0" />
              <span className="truncate">{node.name}</span>
            </button>
          );
        })}
      </div>
    );
  };

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
                    ) : nodes.length === 0 ? (
                        <div className="text-gray-500 text-center py-10 text-xs italic">No extracted files found.<br/>(This skill might be from before the update)</div>
                    ) : (
                      renderTree('', 0)
                    )}
                </div>
                <div className="p-2 border-t border-cyber-border/30 text-[10px] text-gray-600 font-mono text-center">
                    {nodes.length} items
                </div>
            </div>

            {/* Right Pane: Code Viewer */}
            <div className="w-2/3 flex flex-col bg-[#0d0d0d] relative">
                <div className="p-3 border-b border-cyber-border/30 bg-cyber-panel/10 text-xs font-mono text-gray-400 flex items-center justify-between">
                    <div className="flex items-center">
                        <Code size={14} className="mr-2 text-cyber-blue" />
                        {selectedNode ? selectedNode.path : 'No file selected'}
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar p-4 relative">
                    {(loadingContent || loadingZip) ? (
                         <div className="absolute inset-0 flex items-center justify-center text-cyber-blue bg-black/50 backdrop-blur-sm">
                             <Loader2 className="animate-spin mr-2" /> Loading content...
                         </div>
                    ) : selectedNode ? (
                        <div className="text-xs text-gray-300 leading-relaxed font-code">
                          {isMarkdown ? (
                            <div className="prose prose-invert max-w-none">
                              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                {fileContent}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap font-code">
                              {fileContent}
                            </pre>
                          )}
                          {fileBlobUrl && (
                            <div className="mt-4">
                              <a
                                href={fileBlobUrl}
                                download={selectedNode.name}
                                className="inline-flex items-center gap-2 text-xs font-mono px-3 py-2 rounded bg-cyber-panel border border-cyber-border text-gray-300 hover:text-white hover:border-cyber-blue/40 transition-colors"
                              >
                                Download
                              </a>
                            </div>
                          )}
                        </div>
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

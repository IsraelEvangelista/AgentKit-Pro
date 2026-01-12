import React, { useState, useRef, useEffect } from 'react';
import { Globe, Terminal, Loader2, Link2, UploadCloud, X, Wifi, List, Edit2, Check, Star, GitFork, ExternalLink, Folder, FileText } from 'lucide-react';
import { searchSkills, downloadSkillFile, adaptToScrapeResult, fetchSkillReadme, fetchRepoContents, getSkillDetails } from '../services/skillsmpService';
import { saveSkillToDb, saveSkillFileRecord, uploadSkillFile, uploadSkillFileRaw } from '../services/skillsService';
import { ScrapeResult, LogEntry, SkillStatus } from '../types';
import JSZip from 'jszip'; // Make sure this is installed
import ReactMarkdown from 'react-markdown'; // Assuming installed, or just text for now? Text for now to be safe.

interface ScraperPageProps {
  onNavigate: (page: string) => void;
}

const ScraperPage: React.FC<ScraperPageProps> = ({ onNavigate }) => {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // State for multiple results and selection
  const [searchResults, setSearchResults] = useState<any[]>([]); 
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [adaptedResult, setAdaptedResult] = useState<ScrapeResult | null>(null);

  // Editable Tags
  const [editableTags, setEditableTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const logIdCounter = useRef(0);

  const [previewContent, setPreviewContent] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [repoFiles, setRepoFiles] = useState<any[]>([]);

  // Auto scroll logs
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Update editable tags when a new result is selected
  useEffect(() => {
      if (adaptedResult) {
          setEditableTags(adaptedResult.tags);
      }
  }, [adaptedResult]);

  const generateLogId = () => {
      logIdCounter.current += 1;
      return `${Date.now()}-${logIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addLog = (msg: string, type: LogEntry['type'] = 'info') => {
      setLogs(prev => [...prev, { 
          id: generateLogId(), 
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), 
          message: msg, 
          type 
      }]);
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsScraping(true);
    setSearchResults([]);
    setSelectedItem(null);
    setAdaptedResult(null);
    setLogs([]);
    setPreviewContent('');
    
    try {
        addLog(`Initiating search for: ${url}`);
        
        // 1. Search SkillsMP
        const items = await searchSkills(url);
        
        if (items.length === 0) {
            addLog('No skills found matching the query.', 'warning');
            return;
        }

        addLog(`Found ${items.length} potential matches.`);
        
        // Sort by Stars (Desc) then by Latency (Asc)
        const sortedItems = items.sort((a, b) => {
             const starsA = a.metadata?.stars || a.skill?.stars || 0;
             const starsB = b.metadata?.stars || b.skill?.stars || 0;
             return starsB - starsA;
        });

        setSearchResults(sortedItems); 
        
        addLog('Please select a skill from the list below to proceed.');

    } catch (error: any) {
        addLog(`Error: ${error.message}`, 'error');
        console.error(error);
    } finally {
        setIsScraping(false);
    }
  };

  // When selecting a result, try to fetch README
  const handleSelectResult = async (item: any) => {
      const name = item.skill?.name || item.filename || item.title || 'Unknown';
      addLog(`Selected: ${name}`, 'success');
      setSelectedItem(item);
      const adapted = adaptToScrapeResult(item);
      setAdaptedResult(adapted);

      setLoadingPreview(true);
      setPreviewContent('');
      setRepoFiles([]);
      
      // 1. Try Content from Object
      if (adapted.content && adapted.content.length > 50) {
          setPreviewContent(adapted.content);
          setLoadingPreview(false);
          return;
      }
      
      // 2. Try Fetching Readme
      let contentFound = false;
      
      if (adapted.slug) {
         try {
             // Only try details if we suspect missing content
             // const details = await getSkillDetails(adapted.slug); // Optional optimization
         } catch(e) {}
      }

      if (adapted.sourceUrl && adapted.sourceUrl.includes('github.com')) {
          // Use sourceUrl directly as it is clean (no zip appended for subfolders)
          const rawLink = adapted.sourceUrl; 
          
          try {
             const readme = await fetchSkillReadme(rawLink);
             if (readme) {
                 setPreviewContent(readme);
                 contentFound = true;
             }
          } catch (e) {}
          
          // 3. Fallback to File Explorer
          if (!contentFound) {
              try {
                  const files = await fetchRepoContents(rawLink);
                  if (Array.isArray(files) && files.length > 0) {
                      setRepoFiles(files);
                  } else {
                      setPreviewContent('No content or files available to preview.');
                  }
              } catch (e) {
                  setPreviewContent('Failed to load repository contents.');
              }
          }
      }
      
      setLoadingPreview(false);
  };
  
  const handleFileClick = async (file: any) => {
      if (file.type !== 'file') return;
      setLoadingPreview(true);
      try {
          // Construct raw URL for the selected file
          // If using download_url from GitHub API directly:
          if (file.download_url) {
               // Must route through proxy to display text
               const res = await fetch(`http://localhost:3001/preview?url=${encodeURIComponent(file.download_url)}`);
               const text = await res.text();
               setPreviewContent(`FILE: ${file.name}\n\n${text}`);
          }
      } catch (e) {
          addLog('Failed to read file content', 'error');
      }
      setLoadingPreview(false);
  };
  
  const handleAddTag = () => {
      if (newTag && !editableTags.includes(newTag)) {
          setEditableTags([...editableTags, newTag]);
          setNewTag('');
      }
  };

  const handleRemoveTag = (tagToRemove: string) => {
      setEditableTags(editableTags.filter(t => t !== tagToRemove));
  };

  const handleUpload = async () => {
    if (!adaptedResult) return;
    setIsUploading(true);
    addLog('Starting import process...', 'info');

    try {
        // 1. Download File
        if (!adaptedResult.downloadUrl) throw new Error('No download URL available');
        
        addLog(`Attempting download from: ${adaptedResult.downloadUrl}`, 'info');
        
        let blob;
        try {
            blob = await downloadSkillFile(adaptedResult.downloadUrl);
        } catch (err: any) {
            addLog(`Download network error: ${err.message}`, 'error');
            throw err;
        }

        addLog(`Download complete. Blob Size: ${blob.size} bytes`, blob.size > 0 ? 'success' : 'warning');

        if (blob.size === 0) {
            throw new Error("Downloaded file is empty (0 bytes). Check proxy logs.");
        }

        // 2. Unzip Files
        addLog('Extracting files...');
        let zip;
        try {
            zip = await JSZip.loadAsync(blob);
        } catch (err: any) {
             addLog(`Zip extraction failed: ${err.message}`, 'error');
             throw new Error("Failed to unzip file. It might not be a valid zip archive.");
        }

        // Determine if we are in a subfolder based on sourceUrl
        let targetSubfolder = '';
        if (adaptedResult.sourceUrl && adaptedResult.sourceUrl.includes('/tree/')) {
             const parts = adaptedResult.sourceUrl.split('/tree/');
             if (parts.length > 1) {
                 // Format: main/cli-tool/components/...
                 // We need to strip the branch name (first segment) to find path in zip
                 const branchAndPath = parts[1];
                 const pathParts = branchAndPath.split('/');
                 // Remove branch (e.g. 'main')
                 pathParts.shift();
                 targetSubfolder = pathParts.join('/');
             }
        }

        addLog(`Targeting subfolder: ${targetSubfolder || 'ROOT'}`);

        // Loop manual to get contents
        // Zip structure usually starts with "repo-name-branch/"
        const entries = Object.keys(zip.files).filter(name => {
            const isDir = zip.files[name].dir;
            const isSystem = name.includes('node_modules') || name.includes('.git');
            
            if (isDir || isSystem) return false;

            // Filter by subfolder if needed
            if (targetSubfolder) {
                // Check if file path includes the subfolder path
                // Note: Zip root folder name is variable (e.g. claude-code-templates-main/). 
                // We check if the path *segments* match.
                return name.includes(targetSubfolder); 
            }
            
            return true;
        });
        
        if (entries.length === 0) {
            addLog('Zip opened but no valid files found (checked filters).', 'warning');
        } else {
            addLog(`Found ${entries.length} valid files to process.`);
        }

        // 3. Register Skill FIRST to get ID
        addLog('Registering skill in Database...');
        // We use a temporary storage URL or update it later? 
        // Let's set storageUrl to the root folder path we will use.
        const skillSlug = adaptedResult.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        // Use a fixed User ID for Dev
        const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; 
        const storageRoot = `${userId}/${skillSlug}`;

        const savedSkill = await saveSkillToDb({
            title: adaptedResult.title,
            description: adaptedResult.description,
            category: 'Imported',
            url: url,
            storageUrl: storageRoot, // Point to the virtual folder
            level: 'Pleno',
            status: SkillStatus.ACTIVE,
            tags: editableTags,
            stars: adaptedResult.stars,
            forks: adaptedResult.forks,
            remote_updated_at: adaptedResult.updatedAt
        }, userId);

        if (!savedSkill) throw new Error("Failed to save skill to DB");
        const skillId = savedSkill.id;

        // 4. Upload Files & Register Records
        // Upload sequentially to track progress and avoid rate limits
        let completed = 0;
        for (const filename of entries) {
             const fileEntry = zip.files[filename];
             const content = await fileEntry.async('blob');
             
             // Content Type detection (basic)
             let contentType = 'application/octet-stream';
             if (filename.endsWith('.js')) contentType = 'application/javascript';
             if (filename.endsWith('.json')) contentType = 'application/json';
             if (filename.endsWith('.md')) contentType = 'text/markdown';
             if (filename.endsWith('.py')) contentType = 'text/x-python';

             // Upload to Storage
             // Path: userId/skillSlug/filename (preserving folder structure)
             const storagePath = `${storageRoot}/${filename}`;
             addLog(`Uploading: ${filename} (${content.size}b)`);
             
             // Use Raw upload to keep clean structure
             const uploadedPath = await uploadSkillFileRaw(content, storagePath); 

             if (uploadedPath) {
                 await saveSkillFileRecord({
                     skill_id: skillId,
                     filename: filename.split('/').pop() || filename,
                     file_path: filename,
                     storage_path: uploadedPath,
                     size_bytes: content.size,
                     content_type: contentType
                 });
             }
             
             completed++;
             if (completed % 5 === 0) addLog(`Progress: ${completed}/${entries.length} files saved.`);
        }

        addLog(`Import complete! ${completed} files stored.`, 'success');
        setTimeout(() => onNavigate('dashboard'), 1500);

    } catch (e: any) {
        addLog(`Upload failed: ${e.message}`, 'error');
        console.error(e);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-full overflow-hidden p-4 gap-4">
      
      {/* TOP ROW: Search & Logs */}
      <div className="flex gap-4 h-[200px] flex-shrink-0">
          
          {/* SEARCH BOX (Left - 40%) */}
          <div className="w-[40%] bg-[#0f0f0f] border border-cyber-border rounded-lg p-6 shadow-lg flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20"><Globe size={64}/></div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-1 uppercase tracking-widest relative z-10">
                    ADD SKILL NODE
                </h1>
                <p className="text-gray-500 font-mono text-xs mb-4 relative z-10">// Web Scraping & Integration Module</p>
                
                <form onSubmit={handleScrape} className="relative z-10">
                    <div className="relative">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter keywords..."
                            className="w-full bg-[#050505] border border-cyber-border text-white pl-4 pr-24 py-3 rounded focus:outline-none focus:border-cyber-blue transition-colors font-mono text-sm shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={isScraping}
                            className="absolute right-1 top-1 bottom-1 bg-cyber-panel hover:bg-cyber-blue hover:text-black text-white px-4 rounded font-bold text-xs transition-all flex items-center gap-2"
                        >
                            {isScraping ? <Loader2 className="animate-spin" size={14} /> : <Terminal size={14} />}
                            SEARCH
                        </button>
                    </div>
                </form>
          </div>

          {/* LOGS BOX (Right - 60%) */}
          <div className="flex-1 bg-[#050505] border border-cyber-border rounded-lg p-3 font-mono text-xs flex flex-col shadow-inner overflow-hidden">
                <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-800 pb-1 flex-shrink-0">
                  <Terminal size={12} />
                  <span className="uppercase tracking-wider">System Log / Console</span>
                </div>
                <div ref={scrollRef} className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pb-2">
                  {logs.map((log) => (
                    <div key={log.id} className={`flex gap-2 animate-fade-in ${
                      log.type === 'error' ? 'text-red-500' : 
                      log.type === 'success' ? 'text-green-400' : 
                      log.type === 'warning' ? 'text-yellow-500' : 'text-cyber-blue'
                    }`}>
                      <span className="opacity-40 min-w-[60px]">[{log.timestamp}]</span>
                      <span className="break-all">{log.message}</span>
                    </div>
                  ))}
                  {logs.length === 0 && <span className="text-gray-800 italic">Ready for operations...</span>}
                </div>
          </div>
      </div>

      {/* BOTTOM ROW: Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* RESULTS LIST (Left - 350px min, grow slightly) */}
        <div className="w-[450px] bg-[#0f0f0f] border border-cyber-border rounded-lg shadow-xl flex flex-col overflow-hidden">
            <div className="p-3 bg-[#111] border-b border-cyber-border/30 flex justify-between items-center flex-shrink-0">
                 <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Search Results</span>
                 <span className="bg-cyber-blue/10 text-cyber-blue px-2 py-0.5 rounded text-[10px] font-bold">{searchResults.length} matches</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {searchResults.map((item, idx) => {
                    const adapted = adaptToScrapeResult(item);
                    const isSelected = selectedItem === item;
                    return (
                        <div 
                            key={idx}
                            onClick={() => handleSelectResult(item)}
                            className={`p-4 rounded border cursor-pointer transition-all group ${
                                isSelected 
                                ? 'bg-cyber-blue/5 border-cyber-blue' 
                                : 'bg-[#151515] border-transparent hover:border-cyber-border hover:bg-[#1a1a1a]'
                            }`}
                        >
                             <div className="flex justify-between items-start mb-1">
                                <div className="font-bold text-sm text-gray-200 line-clamp-1 group-hover:text-cyber-blue transition-colors">
                                    {adapted.title}
                                </div>
                             </div>
                             
                             {/* Metadata Row */}
                             <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2 font-mono">
                                  {adapted.stars !== undefined && (
                                     <span className="flex items-center text-yellow-500/80"><Star size={8} className="mr-1 fill-current"/>{adapted.stars}</span>
                                  )}
                                  {adapted.forks !== undefined && (
                                     <span className="flex items-center text-blue-400/80"><GitFork size={8} className="mr-1"/>{adapted.forks}</span>
                                  )}
                                  <span className="text-gray-600">
                                      {new Date(adapted.updatedAt || '').toLocaleDateString(undefined, {month:'short', year:'2-digit'})}
                                  </span>
                             </div>

                             <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-2">
                                 {adapted.description !== "No description available." ? adapted.description : <span className="italic opacity-50">No description provided.</span>}
                             </div>
                             
                             {/* Mini Tags */}
                             <div className="flex flex-wrap gap-1">
                                 {adapted.tags.slice(0, 3).map((t, i) => (
                                     <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[#222] text-gray-400 border border-[#333]">{t}</span>
                                 ))}
                             </div>
                        </div>
                    );
                })}
                 {searchResults.length === 0 && !isScraping && (
                     <div className="flex flex-col items-center justify-center h-full text-gray-700 space-y-2">
                         <div className="w-10 h-10 border border-gray-800 rounded flex items-center justify-center">
                            <List size={20} className="opacity-20"/>
                         </div>
                         <span className="text-xs font-mono">No results active</span>
                     </div>
                 )}
            </div>
        </div>

        {/* DETAIL PANEL (Right - Flex-1) */}
        <div className="flex-1 bg-[#0f0f0f] border border-cyber-border rounded-lg shadow-xl flex flex-col overflow-hidden relative">
            {selectedItem && adaptedResult ? (
                <>
                    {/* Header Fixed */}
                    <div className="p-5 border-b border-cyber-border/30 bg-[#121212] flex-shrink-0">
                       <div className="flex justify-between items-start">
                           <div className="flex-1 mr-4">
                               <div className="flex items-center gap-3 mb-2">
                                   <h1 className="text-2xl font-bold text-white tracking-tight">{adaptedResult.title}</h1>
                                   {adaptedResult.downloadUrl && (
                                       <a href={adaptedResult.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyber-blue transition-colors p-1 rounded hover:bg-white/5">
                                           <ExternalLink size={16} />
                                       </a>
                                   )}
                               </div>
                               
                               {/* Edit Tags Area */}
                               <div className="flex flex-wrap gap-2 items-center">
                                   {editableTags.map(tag => (
                                       <span key={tag} className="bg-cyber-panel border border-cyber-border px-2 py-0.5 rounded text-[10px] text-cyber-cyan flex items-center group">
                                           {tag}
                                           <button onClick={() => handleRemoveTag(tag)} className="ml-1 text-cyber-red/50 hover:text-cyber-red">
                                               <X size={10} />
                                           </button>
                                       </span>
                                   ))}
                                   <div className="flex items-center bg-[#000] border border-cyber-border rounded px-2 py-0.5">
                                       <input 
                                           type="text" 
                                           value={newTag}
                                           onChange={(e) => setNewTag(e.target.value)}
                                           onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                           placeholder="+ Tag"
                                           className="bg-transparent border-none text-[10px] text-gray-300 w-12 focus:ring-0 focus:outline-none"
                                       />
                                       <button onClick={handleAddTag}><Check size={10} className="text-green-500 hover:text-green-400"/></button>
                                   </div>
                               </div>
                           </div>
                           
                           <button 
                              onClick={handleUpload}
                              disabled={isUploading}
                              className="bg-gradient-to-r from-cyber-blue to-blue-600 hover:from-cyber-blue/80 hover:to-blue-500 text-black px-6 py-3 rounded font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform hover:scale-105"
                           >
                               {isUploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                               {isUploading ? 'Importing...' : 'Confirm Import'}
                           </button>
                       </div>
                       
                       {/* Stats Row */}
                       <div className="flex items-center gap-6 mt-4 text-xs font-mono border-t border-gray-800 pt-3">
                            <span className="flex items-center text-yellow-500"><Star size={12} className="mr-1.5 fill-current"/> {adaptedResult.stars || 0} stars</span>
                            <span className="flex items-center text-blue-400"><GitFork size={12} className="mr-1.5"/> {adaptedResult.forks || 0} forks</span>
                            <span className="flex items-center text-green-400"><span className="mr-1.5">⚡</span> {adaptedResult.latency}ms latency</span>
                            <span className="flex items-center text-gray-500 ml-auto">Updated: {new Date(adaptedResult.updatedAt || '').toLocaleDateString()}</span>
                       </div>
                    </div>

                    {/* Content Scrollable */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                         
                         {/* Description */}
                         <div className="bg-[#111] border border-cyber-border/20 rounded p-4 relative group">
                             <label className="absolute -top-2 left-3 bg-[#111] px-1 text-[9px] text-cyber-orange font-mono uppercase">Description</label>
                             <p className="text-gray-300 text-sm leading-relaxed">{adaptedResult.description}</p>
                         </div>

                             {/* Readme Preview / File Explorer */}
                             <div className="flex flex-col flex-1 min-h-[300px]">
                                   {/* Terminal Header */}
                                   <div className="bg-[#1e1e1e] rounded-t-lg p-2 flex items-center justify-between border-b border-[#333]">
                                       <div className="flex gap-1.5 ml-2">
                                           <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                                           <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                                           <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                                       </div>
                                       <span className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                                           {repoFiles.length > 0 && !previewContent.includes('FILE:') ? <Folder size={10}/> : <FileText size={10}/>}
                                           {repoFiles.length > 0 && !previewContent.includes('FILE:') ? 'File Explorer' : 'SKILL.md'}
                                       </span>
                                       <div className="w-10"></div> {/* Spacer for center alignment */}
                                   </div>
                                   
                                   <div className="flex-1 bg-[#1e1e1e] rounded-b-lg border border-t-0 border-[#333] p-4 overflow-y-auto custom-scrollbar relative font-mono text-sm leading-6">
                                       {loadingPreview && (
                                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10 text-cyber-blue gap-2">
                                               <Loader2 className="animate-spin" size={20}/> Fetching...
                                           </div>
                                       )}

                                       {repoFiles.length > 0 && !previewContent && !loadingPreview ? (
                                           <div className="space-y-1">
                                                {repoFiles.map((file: any) => (
                                                    <div 
                                                        key={file.path} 
                                                        onClick={() => handleFileClick(file)}
                                                        className="flex items-center gap-3 p-1.5 rounded hover:bg-[#2a2a2a] cursor-pointer group transition-colors"
                                                    >
                                                        {file.type === 'dir' ? <Folder size={14} className="text-[#519aba]"/> : <FileText size={14} className="text-[#a0a0a0]"/>}
                                                        <span className="text-[#cccccc] group-hover:text-white">{file.name}</span>
                                                        <span className="ml-auto text-[10px] text-[#555] group-hover:text-[#777]">
                                                            {file.size ? `${(file.size/1024).toFixed(1)} KB` : ''}
                                                        </span>
                                                    </div>
                                                ))}
                                           </div>
                                       ) : previewContent ? (
                                            <div className="markdown-body text-[#d4d4d4]">
                                               <ReactMarkdown>{previewContent.replace('FILE:', '# File Preview:')}</ReactMarkdown>
                                            </div>
                                       ) : (
                                           <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50">
                                               <List size={32} className="mb-2"/>
                                               <p className="text-xs italic">No content available.</p>
                                           </div>
                                       )}
                                   </div>
                                    
                                    {/* Quick Back Button for Files */}
                                    {repoFiles.length > 0 && previewContent && (
                                        <div className="mt-2 flex justify-end">
                                            <button onClick={() => setPreviewContent('')} className="text-[10px] bg-[#333] hover:bg-[#444] text-white px-3 py-1 rounded transition-colors flex items-center gap-1">
                                                <Folder size={10} /> Back to Files
                                            </button>
                                        </div>
                                    )}

                             </div>

                             {/* Footer info */}
                             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cyber-border/10">
                                 <div className="flex flex-col">
                                     <span className="text-[10px] text-gray-600 uppercase mb-1">Source URL</span>
                                     <span className="text-xs text-cyber-blue font-mono break-all select-all">{adaptedResult.sourceUrl || adaptedResult.downloadUrl}</span>
                                 </div>
                                 <div className="flex flex-col items-end">
                                     <span className="text-[10px] text-gray-600 uppercase mb-1">Target Path</span>
                                     <span className="text-xs text-gray-400 truncate font-mono flex items-center">
                                         <Wifi size={10} className="mr-1"/> Database & Storage (Active)
                                     </span>
                                 </div>
                             </div>
                    </div>
                </>
            ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <Globe size={32} className="opacity-20" />
                      </div>
                      <p className="text-lg font-light tracking-wide">SELECT A SKILL NODE</p>
                      <p className="text-xs font-mono opacity-50 mt-2">To view details and import configuration</p>
                  </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ScraperPage;

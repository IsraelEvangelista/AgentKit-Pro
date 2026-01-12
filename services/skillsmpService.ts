// Local Proxy avoids Cloudflare blocks better than Vite Proxy
const API_BASE_URL = "http://localhost:3001/api";

import { SkillsmpSearchResult, ScrapeResult } from '../types';

export const searchSkills = async (query: string): Promise<SkillsmpSearchResult[]> => {
    // Debug Log
    const apiKey = import.meta.env.VITE_SKILLSMP_API_KEY;
    console.log('[SkillsMP] Search Query:', query);
    console.log('[SkillsMP] API Key Present:', !!apiKey, 'Length:', apiKey?.length);
    
    // AI Search uses GET with query parameter 'q'
    const response = await fetch(`${API_BASE_URL}/skills/ai-search?q=${encodeURIComponent(query)}`, {
        // Headers handled by local proxy
    });

    if (!response.ok) {
        console.error('[SkillsMP] Error Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.status === 401) throw new Error('Invalid API Key (Check .env)');
        if (response.status === 400) throw new Error('Missing query parameter');
        if (response.status === 403) {
            const server = response.headers.get('server') || 'unknown';
            throw new Error(`Access Forbidden by ${server} (403)`);
        }
        throw new Error(`API Error: ${response.statusText}`);
    }

    const json = await response.json();
    // API returns { success: true, data: { data: [ ...items ] } }
    // Or sometimes { items: [...] }
    const items = json.data?.data || json.items || json.data || [];
    
    // Ensure it's an array
    return Array.isArray(items) ? items : [];
};

export const getSkillDetails = async (skillId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/skills/${skillId}`, {
        headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SKILLSMP_API_KEY}`
        }
    });

    if (!response.ok) throw new Error(`Failed to fetch skill details: ${response.statusText}`);
    return await response.json();
};

export const downloadSkillFile = async (dUrl: string): Promise<Blob> => {
    // ALWAYS use the local proxy /download endpoint to avoid CORS on GitHub/External links
    // The proxy runs on port 3001
    const proxyUrl = "http://localhost:3001/download";
    const fetchUrl = `${proxyUrl}?url=${encodeURIComponent(dUrl)}`;

    const response = await fetch(fetchUrl);

    if (!response.ok) throw new Error('Failed to download skill file via proxy');
    return await response.blob();
};

// Adapter to convert API result to Scraper Schema format
// Adapter to convert API result to Scraper Schema format
export const fetchSkillReadme = async (githubUrl: string): Promise<string> => {
    // Convert github repo url to raw content url
    if (!githubUrl.includes('github.com')) return '';

    try {
        const parts = githubUrl.split('github.com/')[1].split('/');
        const owner = parts[0];
        const repo = parts[1];
        let path = '';
        let ref = 'main';

         if (githubUrl.includes('/tree/')) {
            const treeIndex = parts.indexOf('tree');
            ref = parts[treeIndex + 1];
            path = parts.slice(treeIndex + 2).join('/');
        } else if (githubUrl.includes('/blob/')) {
             const blobIndex = parts.indexOf('blob');
             ref = parts[blobIndex + 1];
             path = parts.slice(blobIndex + 2).join('/');
             // If pointing to a file, just fetch that file
             const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
             try {
                const res = await fetch(`http://localhost:3001/preview?url=${encodeURIComponent(rawUrl)}`);
                const text = await res.text();
                if (res.ok && text.length > 50 && !text.includes('404')) return text;
             } catch(e) {}
             return '';
        }

        // Base Raw URL for the identified folder
        const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}${path ? '/' + path : ''}`;
        
        // Try SKILL.md first, then README.md
        const targets = [`${rawBase}/SKILL.md`, `${rawBase}/README.md`];
        
        // If ref is main, also try master just in case, though less likely for deep links
        if (ref === 'main') {
             const rawBaseMaster = `https://raw.githubusercontent.com/${owner}/${repo}/master${path ? '/' + path : ''}`;
             targets.push(`${rawBaseMaster}/SKILL.md`);
             targets.push(`${rawBaseMaster}/README.md`);
        }

        for (const target of targets) {
            try {
                // Route through proxy (returns text)
                const res = await fetch(`http://localhost:3001/preview?url=${encodeURIComponent(target)}`);
                const text = await res.text();
                // Basic validation
                if (res.ok && text.length > 20 && !text.includes('404: Not Found') && !text.includes('Cannot GET')) {
                    return text;
                }
            } catch (e) {
                 // console.warn('Failed to fetch readme candidate:', target);
            }
        }
    } catch(err) {
        console.error("Error parsing GitHub URL:", err);
    }
    return '';
};

export const fetchRepoContents = async (githubUrl: string): Promise<any[]> => {
    try {
        if (!githubUrl.includes('github.com')) return [];

        const parts = githubUrl.split('github.com/')[1].split('/');
        const owner = parts[0];
        const repo = parts[1];
        let path = '';
        let ref = 'main';

         if (githubUrl.includes('/tree/')) {
            const treeIndex = parts.indexOf('tree');
            ref = parts[treeIndex + 1];
            path = parts.slice(treeIndex + 2).join('/');
        }

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
        
        // Use local proxy to fetch GitHub API data
        // This avoids CORS and IP blocking issues
        const proxyUrl = `http://localhost:3001/github-api?url=${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) return [];
        const data = await response.json();
        
        // Ensure we supply an array (GitHub API returns object for single file, array for dir)
        return Array.isArray(data) ? data : [data];
    } catch (e) {
        console.warn('Failed to fetch repo contents via proxy', e);
        return [];
    }
};

export const adaptToScrapeResult = (apiResult: any): ScrapeResult => {
    const skillData = apiResult.skill || {};
    const metadata = apiResult.metadata || skillData.metadata || {};
    
    // Prioritize skill data, fallback to top-level fields
    const title = skillData.name || apiResult.filename || apiResult.title || 'Unknown Skill';
    const description = skillData.description || apiResult.description || apiResult.summary || `File: ${apiResult.filename || 'N/A'}`;
    
    // Determine Source & Download URL
    let sourceUrl = apiResult.download_url || skillData.githubUrl || skillData.skillUrl || apiResult.url || '';
    let downloadUrl = sourceUrl;
    
    // Fix GitHub Repo URLs
    if (downloadUrl && downloadUrl.includes('github.com')) {
        // Remove trailing slash
        downloadUrl = downloadUrl.replace(/\/$/, '');
        
        // Logic to construct Zip URL from ANY GitHub URL (root or subfolder)
        // 1. Clean the URL to find root repo
        const parts = downloadUrl.split('github.com/')[1].split('/');
        const owner = parts[0];
        const repo = parts[1];
        
        // Always download the root zip. We will filter files locally.
        downloadUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
    }

    // Extract tags/categories
    const tags = apiResult.tags || apiResult.categories || (skillData.author ? [skillData.author] : []) || [];
    
    return {
        title,
        description,
        sourceUrl,
        downloadUrl,
        tags,
        latency: Math.round(apiResult.score * 100) || 0,
        stars: metadata.stars || skillData.stars || 0,
        forks: metadata.forks || skillData.forks || 0,
        updatedAt: metadata.updated_at || skillData.updated_at || new Date().toISOString(),
        content: skillData.content || skillData.readme || apiResult.content || ''
    };
};

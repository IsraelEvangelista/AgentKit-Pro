// Dynamic Base URL based on Environment
// In PROD (Vercel), we utilize the Serverless Functions at /api/...
// In DEV, we use the local proxy at http://localhost:3001/api/...

const PROXY_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// Debug Log
console.log(`[SkillsMP] Environment: ${import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`[SkillsMP] Service Base URL: ${PROXY_BASE}`);

import { SkillsmpSearchResult, ScrapeResult } from '../types';

export const searchSkills = async (query: string): Promise<SkillsmpSearchResult[]> => {
    // Debug Log
    console.log('[SkillsMP] Search Query:', query);
    
    // AI Search uses GET with query parameter 'q'
    // Target: /api/skills/ai-search
    const response = await fetch(`${PROXY_BASE}/skills/ai-search?q=${encodeURIComponent(query)}`, {
        // Headers handled by proxy/function
    });

    if (!response.ok) {
        console.error('[SkillsMP] Error Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.status === 401) throw new Error('Invalid API Key (Check .env)');
        if (response.status === 400) throw new Error('Missing query parameter');
        throw new Error(`API Error: ${response.statusText}`);
    }

    const json = await response.json();
    const items = json.data?.data || json.items || json.data || [];
    return Array.isArray(items) ? items : [];
};

export const getSkillDetails = async (skillId: string): Promise<any> => {
    // This might not be fully supported by Vercel function yet if we only created ai-search
    // But assuming generic proxy or direct implementation. 
    // Ideally we should create api/skills/[id].js if needed.
    // For now, let's assume the search provides enough data or use search logic.
    // NOTE: The user's prompt implies we fixed search. Details might not be used heavily yet.
    const response = await fetch(`${PROXY_BASE}/skills/${encodeURIComponent(skillId)}`);

    if (!response.ok) throw new Error(`Failed to fetch skill details: ${response.statusText}`);
    return await response.json();
};

export const downloadSkillFile = async (dUrl: string): Promise<Blob> => {
    if (!dUrl || !/^https?:\/\//i.test(dUrl)) {
        throw new Error('Invalid download URL');
    }
    // Target: /api/download?url=...
    const fetchUrl = `${PROXY_BASE}/download?url=${encodeURIComponent(dUrl)}`;

    const response = await fetch(fetchUrl);

    if (!response.ok) {
        const details = await response.text().catch(() => '');
        const suffix = details ? `: ${details.slice(0, 300)}` : '';
        throw new Error(`Failed to download skill file via proxy (${response.status})${suffix}`);
    }
    return await response.blob();
};

export const previewFileContent = async (fileUrl: string): Promise<string> => {
    // Target: /api/preview?url=...
    const fetchUrl = `${PROXY_BASE}/preview?url=${encodeURIComponent(fileUrl)}`;
    
    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(`Failed to preview file: ${response.statusText}`);
    return await response.text();
}

export const fetchSkillReadme = async (githubUrl: string): Promise<string> => {
    if (!githubUrl.includes('github.com')) return '';

    try {
        const parts = githubUrl.split('github.com/')[1].split('/');
        const owner = parts[0];
        const repo = parts[1];
        let path = '';
        let ref = 'main'; // Default assumption

        // Basic parsing for tree/blob
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
                return await previewFileContent(rawUrl);
             } catch(e) {}
             return '';
        }

        // Base Raw URL for the identified folder
        const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}${path ? '/' + path : ''}`;
        
        // Try SKILL.md first, then README.md
        const targets = [`${rawBase}/SKILL.md`, `${rawBase}/README.md`];
        
        if (ref === 'main') {
             const rawBaseMaster = `https://raw.githubusercontent.com/${owner}/${repo}/master${path ? '/' + path : ''}`;
             targets.push(`${rawBaseMaster}/SKILL.md`);
             targets.push(`${rawBaseMaster}/README.md`);
        }

        for (const target of targets) {
            try {
                const text = await previewFileContent(target);
                if (text.length > 20 && !text.includes('404: Not Found')) {
                    return text;
                }
            } catch (e) { }
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
        
        // Target: /api/github-api?url=...
        const proxyUrl = `${PROXY_BASE}/github-api?url=${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) return [];
        const data = await response.json();
        
        return Array.isArray(data) ? data : [data];
    } catch (e) {
        console.warn('Failed to fetch repo contents via proxy', e);
        return [];
    }
};

export const adaptToScrapeResult = (apiResult: any): ScrapeResult => {
    const skillData = apiResult.skill || {};
    const metadata = apiResult.metadata || skillData.metadata || {};

    const title = skillData.name || apiResult.filename || apiResult.title || 'Unknown Skill';
    const description = skillData.description || apiResult.description || apiResult.summary || `File: ${apiResult.filename || 'N/A'}`;

    let sourceUrl = apiResult.download_url || skillData.githubUrl || skillData.skillUrl || apiResult.url || '';
    let downloadUrl = sourceUrl;

    if (downloadUrl && downloadUrl.includes('github.com')) {
        downloadUrl = downloadUrl.replace(/\/$/, '');
        const parts = downloadUrl.split('github.com/')[1].split('/');
        const owner = parts[0];
        const repo = parts[1];
        downloadUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
    }

    const normalizeCategory = (value: unknown) => {
        if (typeof value !== 'string') return undefined;
        const c = value.trim();
        if (!c) return undefined;
        return c;
    };

    const deriveCategoryFromGithubUrl = (value: unknown) => {
        if (typeof value !== 'string' || !value.includes('github.com/')) return undefined;
        try {
            const u = new URL(value);
            const parts = u.pathname.split('/').filter(Boolean);
            const treeIndex = parts.indexOf('tree');
            if (treeIndex === -1) return undefined;
            const afterTree = parts.slice(treeIndex + 2);
            const pluginsIndex = afterTree.indexOf('plugins');
            if (pluginsIndex !== -1 && afterTree.length > pluginsIndex + 1) {
                return normalizeCategory(afterTree[pluginsIndex + 1]);
            }
            return undefined;
        } catch {
            return undefined;
        }
    };

    const deriveCategoryFromFilename = (value: unknown) => {
        if (typeof value !== 'string') return undefined;
        const matches = value.match(/plugins-([a-z0-9-]+)-skills/gi);
        if (matches && matches.length > 0) {
            const last = matches[matches.length - 1] || '';
            const m = last.match(/plugins-([a-z0-9-]+)-skills/i);
            return normalizeCategory(m?.[1]);
        }
        return undefined;
    };

    // Extract category from API response
    // The API may return category as a string, categories array, or within skillData
    const category =
        normalizeCategory(skillData.category) ||
        normalizeCategory(apiResult.category) ||
        (Array.isArray(apiResult.categories) ? normalizeCategory(apiResult.categories[0]) : undefined) ||
        (Array.isArray(skillData.categories) ? normalizeCategory(skillData.categories[0]) : undefined) ||
        deriveCategoryFromGithubUrl(skillData.githubUrl) ||
        deriveCategoryFromGithubUrl(apiResult.url) ||
        deriveCategoryFromFilename(apiResult.filename) ||
        undefined;

    // Tags exclude the primary category to avoid duplication
    const apiTags = apiResult.tags || apiResult.categories || [];
    const tags = category
        ? apiTags.filter((t: string) => t !== category)
        : apiTags;

    return {
        title,
        description,
        sourceUrl,
        downloadUrl,
        category,
        tags,
        latency: Math.round(apiResult.score * 100) || 0,
        stars: metadata.stars || skillData.stars || 0,
        forks: metadata.forks || skillData.forks || 0,
        updatedAt: metadata.updated_at || skillData.updated_at || new Date().toISOString(),
        content: skillData.content || skillData.readme || apiResult.content || ''
    };
};

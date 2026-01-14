import JSZip from 'jszip';
import getSupabaseAdmin from './_supabaseAdmin.js';
import { requireMcpConnection } from './_auth.js';

const isTextLike = (path) => {
  const p = String(path || '').toLowerCase();
  return (
    p.endsWith('.md') ||
    p.endsWith('.txt') ||
    p.endsWith('.json') ||
    p.endsWith('.yml') ||
    p.endsWith('.yaml') ||
    p.endsWith('.toml') ||
    p.endsWith('.xml') ||
    p.endsWith('.csv') ||
    p.endsWith('.ts') ||
    p.endsWith('.tsx') ||
    p.endsWith('.js') ||
    p.endsWith('.jsx') ||
    p.endsWith('.py') ||
    p.endsWith('.go') ||
    p.endsWith('.rs') ||
    p.endsWith('.java') ||
    p.endsWith('.rb') ||
    p.endsWith('.php') ||
    p.endsWith('.sh')
  );
};

const isAttachmentCandidate = (path) => {
  const p = String(path || '').toLowerCase();
  if (p.startsWith('attachments/') || p.includes('/attachments/')) return true;
  if (p.startsWith('assets/') || p.includes('/assets/')) return true;
  if (p.startsWith('docs/') || p.includes('/docs/')) return true;
  return !isTextLike(p);
};

const readZipText = async (zip, internalPath) => {
  const file = zip.file(internalPath);
  if (!file) return null;
  return await file.async('text');
};

const readZipBase64 = async (zip, internalPath) => {
  const file = zip.file(internalPath);
  if (!file) return null;
  return await file.async('base64');
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const connection = await requireMcpConnection(req, res);
  if (!connection) return;

  const skillId = typeof req.query?.skillId === 'string' ? req.query.skillId : null;
  if (!skillId) {
    res.status(400).json({ error: 'Missing skillId' });
    return;
  }

  const allowed = Array.isArray(connection.allowed_skill_ids) ? connection.allowed_skill_ids : [];
  if (!allowed.includes(skillId)) {
    res.status(403).json({ error: 'Skill not allowed for this token' });
    return;
  }

  const includePaths = Array.isArray(req.body?.paths) ? req.body.paths.filter((p) => typeof p === 'string') : [];
  const includeAllAttachments = Boolean(req.body?.includeAllAttachments);
  const maxAttachmentBytes = typeof req.body?.maxAttachmentBytes === 'number' ? req.body.maxAttachmentBytes : 512_000;
  const maxFiles = typeof req.body?.maxFiles === 'number' ? req.body.maxFiles : 2000;

  const supabase = getSupabaseAdmin();

  const { data: skill, error: skillError } = await supabase
    .from('skills')
    .select('id,title,description,category,category_id,tags,level,status,source_url,storage_path,remote_updated_at')
    .eq('id', skillId)
    .eq('user_id', connection.user_id)
    .maybeSingle();

  if (skillError) {
    res.status(500).json({ error: 'Failed to load skill metadata' });
    return;
  }
  if (!skill) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }
  if (!skill.storage_path) {
    res.status(409).json({ error: 'Skill has no storage_path (ZIP not available)' });
    return;
  }

  const { data: zipBlob, error: zipError } = await supabase.storage.from('skills').download(skill.storage_path);
  if (zipError || !zipBlob) {
    res.status(500).json({ error: 'Failed to download skill zip' });
    return;
  }

  const buf = Buffer.from(await zipBlob.arrayBuffer());
  const zip = await JSZip.loadAsync(buf);

  const fileNames = Object.keys(zip.files || {}).filter((n) => n && !zip.files[n].dir);
  const limitedFiles = fileNames.slice(0, maxFiles);

  const findSkillMd = () => {
    const exact = limitedFiles.find((p) => p.toLowerCase().endsWith('/skill.md')) || limitedFiles.find((p) => p.toLowerCase() === 'skill.md');
    if (exact) return exact;
    const readme = limitedFiles.find((p) => p.toLowerCase().endsWith('/readme.md')) || limitedFiles.find((p) => p.toLowerCase() === 'readme.md');
    return readme || null;
  };

  const skillMdPath = findSkillMd();
  const skillMd = skillMdPath ? await readZipText(zip, skillMdPath) : null;

  const attachments = limitedFiles
    .filter((p) => p !== skillMdPath)
    .filter((p) => isAttachmentCandidate(p))
    .map((p) => ({
      path: p,
      isText: isTextLike(p),
    }));

  const includeSet = new Set(includeAllAttachments ? attachments.map((a) => a.path) : includePaths);
  const included = [];

  for (const p of Array.from(includeSet)) {
    if (typeof p !== 'string') continue;
    if (!limitedFiles.includes(p)) continue;
    const isText = isTextLike(p);
    if (isText) {
      const text = await readZipText(zip, p);
      if (typeof text === 'string') {
        included.push({ path: p, type: 'text', text });
      }
      continue;
    }

    const base64 = await readZipBase64(zip, p);
    if (typeof base64 === 'string') {
      const approxBytes = Math.floor((base64.length * 3) / 4);
      if (approxBytes <= maxAttachmentBytes) {
        included.push({ path: p, type: 'base64', base64 });
      } else {
        included.push({ path: p, type: 'omitted', reason: 'too_large' });
      }
    }
  }

  res.status(200).json({
    skill,
    skillMdPath,
    skillMd,
    attachments,
    included,
    limits: { maxFiles, maxAttachmentBytes },
  });
}


import getSupabaseAdmin from './_supabaseAdmin.js';
import { requireMcpConnection } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('skills')
    .select('id,title,description,category,category_id,tags,level,status,source_url,remote_updated_at')
    .eq('id', skillId)
    .eq('user_id', connection.user_id)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: 'Failed to load skill' });
    return;
  }
  if (!data) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }

  res.status(200).json({ skill: data });
}


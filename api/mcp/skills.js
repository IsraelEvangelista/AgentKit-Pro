import getSupabaseAdmin from './_supabaseAdmin.js';
import { requireMcpConnection } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const connection = await requireMcpConnection(req, res);
  if (!connection) return;

  const supabase = getSupabaseAdmin();

  const allowed = Array.isArray(connection.allowed_skill_ids) ? connection.allowed_skill_ids : [];
  if (allowed.length === 0) {
    res.status(200).json({ skills: [] });
    return;
  }

  const categoryId = typeof req.query?.categoryId === 'string' ? req.query.categoryId : null;
  const categorySlug = typeof req.query?.category === 'string' ? req.query.category : null;

  let query = supabase
    .from('skills')
    .select('id,title,description,category,category_id,tags,level,status,source_url,storage_path,remote_updated_at')
    .in('id', allowed)
    .eq('user_id', connection.user_id)
    .order('updated_at', { ascending: false });

  if (categoryId) query = query.eq('category_id', categoryId);
  if (categorySlug) {
    const { data: cat, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (!catError && cat?.id) {
      query = query.eq('category_id', cat.id);
    }
  }

  const { data, error } = await query;
  if (error) {
    res.status(500).json({ error: 'Failed to list skills' });
    return;
  }

  res.status(200).json({ skills: data || [] });
}


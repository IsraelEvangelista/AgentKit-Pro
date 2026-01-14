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
    res.status(200).json({ categories: [] });
    return;
  }

  const { data: skills, error } = await supabase
    .from('skills')
    .select('id,category,category_id')
    .in('id', allowed)
    .eq('user_id', connection.user_id);

  if (error) {
    res.status(500).json({ error: 'Failed to load skills' });
    return;
  }

  const categoryIds = Array.from(
    new Set((skills || []).map((s) => s.category_id).filter((v) => typeof v === 'string' && v))
  );

  let categories = [];
  if (categoryIds.length > 0) {
    const { data: cats, error: catsError } = await supabase
      .from('categories')
      .select('id,name,slug,description,icon,color')
      .in('id', categoryIds);
    if (!catsError && cats) {
      categories = cats;
    }
  }

  const legacy = Array.from(
    new Set((skills || []).map((s) => s.category).filter((v) => typeof v === 'string' && v.trim()))
  ).map((name) => ({
    id: null,
    name,
    slug: String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    description: null,
    icon: null,
    color: null,
  }));

  const byKey = new Map();
  [...categories, ...legacy].forEach((c) => {
    const key = c?.id ? `id:${c.id}` : `legacy:${c.slug}`;
    if (!byKey.has(key)) byKey.set(key, c);
  });

  res.status(200).json({ categories: Array.from(byKey.values()) });
}


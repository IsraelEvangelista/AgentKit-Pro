import crypto from 'crypto';
import getSupabaseAdmin from './_supabaseAdmin.js';

const toBearerToken = (value) => {
  if (!value || typeof value !== 'string') return null;
  const v = value.trim();
  if (!v) return null;
  if (v.toLowerCase().startsWith('bearer ')) return v.slice(7).trim() || null;
  return v;
};

const sha256Hex = (value) => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

export const requireMcpConnection = async (req, res) => {
  const token = toBearerToken(req.headers?.authorization);
  if (!token) {
    res.status(401).json({ error: 'Missing Authorization bearer token' });
    return null;
  }

  const tokenHash = sha256Hex(token);
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Supabase admin client not configured';
    res.status(500).json({ error: msg });
    return null;
  }

  const { data: connection, error } = await supabase
    .from('mcp_connections')
    .select('id,user_id,allowed_skill_ids,revoked_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: 'Failed to validate token' });
    return null;
  }

  if (!connection || connection.revoked_at) {
    res.status(401).json({ error: 'Invalid or revoked token' });
    return null;
  }

  await supabase
    .from('mcp_connections')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', connection.id);

  return connection;
};

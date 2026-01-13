import { supabase } from './supabaseClient';
import { Skill, SkillStatus } from '../types';

const BUCKET_NAME = 'skills';
const TABLE_NAME = 'skills';

export const uploadSkillFile = async (fileBlob: Blob, fileName: string): Promise<string | null> => {
    const filePath = `${Date.now()}_${fileName}`;
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBlob);

    if (error) {
        console.error('Storage upload error:', error);
        throw error;
    }

    return data?.path || null;
};

export const uploadSkillFileRaw = async (fileBlob: Blob, storagePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBlob, { upsert: true });

    if (error) {
        console.error('Storage upload raw error:', error);
        throw error;
    }

    return data?.path || null;
};

export const getSkillFileContent = async (storagePath: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(storagePath);

  if (error) {
    console.error('Error downloading file:', error);
    return null;
  }

  return await data.text();
};

export const getSkillZipBlob = async (storagePath: string): Promise<Blob | null> => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(storagePath);

  if (error) {
    console.error('Error downloading zip:', error);
    return null;
  }

  return data;
};

// Passing userId as argument since we might use mock auth
export const saveSkillToDb = async (skillData: Omit<Skill, 'id' | 'dateAdd'> & { categoryId?: string }, userId?: string): Promise<Skill | null> => {
  // Map Frontend CamelCase to DB Snake_Case
  const payload = {
    user_id: userId,
    title: skillData.title,
    description: skillData.description,
    category: skillData.category,
    category_id: skillData.categoryId,
    level: skillData.level,
    tags: skillData.tags,
    source_url: skillData.url,
    storage_path: skillData.storageUrl,
    status: skillData.status,
    stars: skillData.stars,
    forks: skillData.forks,
    remote_updated_at: skillData.remote_updated_at
  };
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error saving skill to DB:', error);
    throw error;
  }
  
  // Map back to CamelCase (or return as is if types allow)
  // For now returning raw DB result to avoid double mapping issues if caller expects specific format
  // But ideally we should return a Skill object.
  // Let's assume the caller just needs the ID for now.
  return {
      ...payload,
      id: data.id,
      dateAdded: data.created_at,
      storageUrl: data.storage_path
  } as unknown as Skill;
};

export const updateSkillStoragePath = async (skillId: string, storagePath: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({ storage_path: storagePath })
    .eq('id', skillId);

  if (error) throw error;
};

export const saveSkillFileRecord = async (fileData: { 
  skill_id: string; 
  filename: string; 
  file_path: string; 
  storage_path: string; 
  size_bytes: number; 
  content_type: string 
  node_type?: 'file' | 'dir';
  path?: string;
  dir_path?: string;
  basename?: string;
  ext?: string | null;
  depth?: number | null;
  zip_internal_path?: string | null;
  content_storage_path?: string | null;
}) => {
  const { data, error } = await supabase
    .from('skill_files')
    .insert([fileData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const saveSkillFileRecordsBulk = async (
  records: Array<{
    skill_id: string;
    filename: string;
    file_path: string;
    storage_path: string;
    size_bytes: number | null;
    content_type: string | null;
    node_type: 'file' | 'dir';
    path: string;
    dir_path: string;
    basename: string;
    ext: string | null;
    depth: number;
    zip_internal_path: string | null;
    content_storage_path: string | null;
  }>
): Promise<void> => {
  const chunkSize = 500;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('skill_files')
      .insert(chunk);
    if (error) throw error;
  }
};

export const getSkillFiles = async (skillId: string) => {
    const { data, error } = await supabase
        .from('skill_files')
        .select('*')
        .eq('skill_id', skillId);
    
    if (error) throw error;
    return data;
};

export const deleteSkill = async (id: string) => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};

export const deleteSkillNode = async (skill: Pick<Skill, 'id' | 'storageUrl'>): Promise<void> => {
  const storagePath = skill.storageUrl;
  if (storagePath) {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);
    if (error) {
      console.error('Storage delete error:', error);
    }
  }

  await deleteSkill(skill.id);
};

export const getStoredSkills = async (userId?: string): Promise<Skill[]> => {
  let query = supabase
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
  
  // Map DB fields to Frontend interface if needed (assuming 1:1 match roughly)
  const rows = (data ?? []) as unknown[];
  return rows
    .map((row): Skill | null => {
      if (!row || typeof row !== 'object') return null;
      const r = row as Record<string, unknown>;
      const id = typeof r.id === 'string' ? r.id : null;
      const title = typeof r.title === 'string' ? r.title : null;
      const createdAt = typeof r.created_at === 'string' ? r.created_at : null;
      if (!id || !title || !createdAt) return null;

      const tags = Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === 'string') : [];
      const status = typeof r.status === 'string' ? (r.status as SkillStatus) : SkillStatus.ACTIVE;

      return {
        id,
        title,
        description: typeof r.description === 'string' ? r.description : '',
        category: typeof r.category === 'string' ? r.category : '',
        level: typeof r.level === 'string' ? r.level : '',
        tags,
        url: typeof r.source_url === 'string' ? r.source_url : undefined,
        storageUrl: typeof r.storage_path === 'string' ? r.storage_path : undefined,
        status,
        dateAdded: createdAt,
        user_id: typeof r.user_id === 'string' ? r.user_id : undefined,
        stars: typeof r.stars === 'number' ? r.stars : 0,
        forks: typeof r.forks === 'number' ? r.forks : 0,
        remote_updated_at: typeof r.remote_updated_at === 'string' ? r.remote_updated_at : undefined
      };
    })
    .filter((s): s is Skill => s !== null);
};


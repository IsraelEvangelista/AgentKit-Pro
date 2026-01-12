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

// Passing userId as argument since we might use mock auth
export const saveSkillToDb = async (skillData: Omit<Skill, 'id' | 'dateAdded'>, userId?: string): Promise<Skill | null> => {
  // Map Frontend CamelCase to DB Snake_Case
  const payload = {
    user_id: userId,
    title: skillData.title,
    description: skillData.description,
    category: skillData.category,
    level: skillData.level,
    tags: skillData.tags,
    url: skillData.url,
    storage_path: skillData.storageUrl, // Corrected Mapping: storageUrl -> storage_path
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
      storageUrl: data.storage_url
  } as unknown as Skill;
};

export const saveSkillFileRecord = async (fileData: { 
  skill_id: string; 
  filename: string; 
  file_path: string; 
  storage_path: string; 
  size_bytes: number; 
  content_type: string 
}) => {
  const { data, error } = await supabase
    .from('skill_files')
    .insert([fileData])
    .select()
    .single();

  if (error) throw error;
  return data;
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
  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.category,
    level: item.level,
    tags: item.tags || [],
    url: item.url,
    storageUrl: item.storage_url,
    status: item.status,
    dateAdded: item.created_at,
    user_id: item.user_id
  }));
};


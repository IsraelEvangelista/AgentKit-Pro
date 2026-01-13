export interface User {
  id: string;
  email: string;
  role: 'operator' | 'admin';
  display_name?: string;
  avatar?: string;
}

export enum SkillStatus {
  ACTIVE = 'Operational',
  PAUSED = 'Paused',
  COMPLETED = 'Archived',
  PENDING = 'Analyzing'
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: string; // Legacy category name (for backward compatibility)
  categoryId?: string; // Foreign key to categories table
  level: string;
  tags: string[];
  url?: string;
  storageUrl?: string; // Path to the original zip (optional now)
  status: SkillStatus;
  dateAdded: string;
  user_id?: string;
  stars?: number;
  forks?: number;
  remote_updated_at?: string;
}

export interface SkillFile {
  id: string;
  skill_id: string;
  node_type?: 'file' | 'dir';
  path?: string;
  dir_path?: string;
  basename?: string;
  ext?: string | null;
  depth?: number | null;
  filename: string;
  file_path: string;
  storage_path: string;
  zip_internal_path?: string | null;
  content_storage_path?: string | null;
  size_bytes: number | null;
  content_type: string | null;
  created_at: string;
}

export interface ScrapeResult {
  title: string;
  slug?: string;
  description: string;
  sourceUrl?: string; // Original URL (e.g. GitHub tree view)
  downloadUrl: string; // Zip download URL
  category?: string; // Primary category from SkillsMP
  tags: string[];
  latency: number;
  stars?: number;
  forks?: number;
  updatedAt?: string;
  content?: string;
}

export interface LogEntry {
  id: string | number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface SkillsmpSearchResult {
    id: string;
    title: string;
    description: string;
    tags: string[];
    download_url?: string;
    metadata?: Record<string, unknown>;
}


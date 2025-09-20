import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DatabaseDocument {
  id: string;
  filename: string;
  content: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  user_id?: string;
}

export interface DatabaseChunk {
  id: string;
  document_id: string;
  content: string;
  embedding: number[];
  chunk_index: number;
  metadata: Record<string, any>;
  created_at: string;
}
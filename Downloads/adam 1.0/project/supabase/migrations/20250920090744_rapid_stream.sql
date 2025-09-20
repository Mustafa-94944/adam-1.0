/*
  # RAG Application Database Schema

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `filename` (text)
      - `content` (text)
      - `file_type` (text)
      - `file_size` (integer)
      - `uploaded_at` (timestamp)
      - `user_id` (uuid, optional for future auth)
    - `document_chunks`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `content` (text)
      - `embedding` (vector(768))
      - `chunk_index` (integer)
      - `metadata` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users (or public for demo)

  3. Extensions
    - Enable pgvector extension for vector operations
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  content text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  uploaded_at timestamptz DEFAULT now(),
  user_id uuid
);

-- Create document_chunks table with vector embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content text NOT NULL,
  embedding vector(768),
  chunk_index integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies (open for demo, restrict for production)
CREATE POLICY "Allow public access to documents"
  ON documents
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "Allow public access to chunks"
  ON document_chunks
  FOR ALL
  TO public
  USING (true);
-- ════════════════════════════════════════════════════════════════════════════
-- Migration: RAG Feedback System for Query Guide
-- Adds pgvector extension, approved/rejected example stores, cosine-similarity
-- RPC, and RLS policies.
--
-- Run in Supabase SQL Editor (migrations are not auto-applied).
-- Requires pgvector to be available on your Supabase plan (it is by default).
-- ════════════════════════════════════════════════════════════════════════════


-- ── 1. pgvector extension ─────────────────────────────────────────────────────
-- Enables vector column type and distance operators (<=> cosine, <-> L2, <#> IP).
CREATE EXTENSION IF NOT EXISTS vector;


-- ── 2. approved_examples ──────────────────────────────────────────────────────
-- Stores NL question + SQL pairs that received positive feedback (👍).
-- The embedding column allows cosine-similarity retrieval at generation time.
-- thumbs_up_count is incremented instead of inserting a duplicate when a
-- near-identical question is approved again (threshold 0.95 in ragSqlService).
CREATE TABLE IF NOT EXISTS public.approved_examples (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question        TEXT        NOT NULL,
  sql             TEXT        NOT NULL,
  embedding       vector(1536),            -- text-embedding-3-small (1536-dim)
  thumbs_up_count INTEGER     NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.approved_examples                IS 'RAG store: approved NL→SQL pairs used as few-shot prompt examples.';
COMMENT ON COLUMN public.approved_examples.embedding      IS 'text-embedding-3-small vector (1536 dims). NULL until embedded.';
COMMENT ON COLUMN public.approved_examples.thumbs_up_count IS 'Incremented on near-duplicate approval instead of inserting a new row.';


-- ── 3. IVFFlat index for approximate nearest-neighbour search ─────────────────
-- Enables sub-linear cosine similarity lookups.
-- lists=100 suits thousands of rows; raise to 200–500 for millions.
-- Index only activates once the table has at least ~lists*39 rows (~3900).
-- Exact sequential scan is used automatically below that threshold.
CREATE INDEX IF NOT EXISTS approved_examples_embedding_idx
  ON public.approved_examples
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);


-- ── 4. rejected_examples ──────────────────────────────────────────────────────
-- Stores thumbs-down (👎) feedback.
-- corrected_sql is populated when the user provides a correction;
-- ragSqlService also inserts that pair into approved_examples.
CREATE TABLE IF NOT EXISTS public.rejected_examples (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question      TEXT        NOT NULL,
  bad_sql       TEXT        NOT NULL,
  corrected_sql TEXT,                      -- NULL when user dismisses without correcting
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.rejected_examples              IS 'RAG store: rejected NL→SQL pairs. corrected_sql is mirrored into approved_examples.';
COMMENT ON COLUMN public.rejected_examples.corrected_sql IS 'User-provided correction. When set, also stored in approved_examples.';


-- ── 5. updated_at trigger for approved_examples ───────────────────────────────
-- Reuses the update_updated_at_column() function created in earlier migrations.
CREATE TRIGGER approved_examples_updated_at
  BEFORE UPDATE ON public.approved_examples
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- ── 6. RPC: cosine similarity search ──────────────────────────────────────────
-- Called from ragSqlService.ts before SQL generation to retrieve relevant examples.
-- Returns rows whose cosine similarity to query_embedding exceeds match_threshold,
-- ordered by closest match first.
--
-- Parameters:
--   query_embedding  — 1536-dim vector produced by text-embedding-3-small
--   match_threshold  — minimum similarity to include (0.0–1.0, default 0.78)
--   match_count      — maximum rows to return (default 5)
CREATE OR REPLACE FUNCTION public.match_approved_examples(
  query_embedding vector(1536),
  match_threshold FLOAT  DEFAULT 0.78,
  match_count     INT    DEFAULT 5
)
RETURNS TABLE (
  id              UUID,
  question        TEXT,
  sql             TEXT,
  thumbs_up_count INTEGER,
  similarity      FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    question,
    sql,
    thumbs_up_count,
    1 - (embedding <=> query_embedding) AS similarity
  FROM public.approved_examples
  WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

COMMENT ON FUNCTION public.match_approved_examples IS
  'Returns approved_examples rows whose cosine similarity to query_embedding exceeds match_threshold.';


-- ── 7. Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE public.approved_examples  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejected_examples  ENABLE ROW LEVEL SECURITY;

-- approved_examples: any authenticated user can read (RAG retrieval)
CREATE POLICY "authenticated users can select approved_examples"
  ON public.approved_examples FOR SELECT
  TO authenticated
  USING (true);

-- approved_examples: any authenticated user can insert (new thumbs-up pair)
CREATE POLICY "authenticated users can insert approved_examples"
  ON public.approved_examples FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- approved_examples: any authenticated user can update (increment thumbs_up_count)
CREATE POLICY "authenticated users can update approved_examples"
  ON public.approved_examples FOR UPDATE
  TO authenticated
  USING (true);

-- rejected_examples: any authenticated user can insert (thumbs-down feedback)
CREATE POLICY "authenticated users can insert rejected_examples"
  ON public.rejected_examples FOR INSERT
  TO authenticated
  WITH CHECK (true);

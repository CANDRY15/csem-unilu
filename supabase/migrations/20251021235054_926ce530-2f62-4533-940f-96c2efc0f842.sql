-- Add type and featured columns to publications table
ALTER TABLE public.publications 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'article' CHECK (type IN ('article', 'event')),
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- Create index for featured publications
CREATE INDEX IF NOT EXISTS idx_publications_featured ON public.publications(featured, published_at DESC) WHERE status = 'published';
-- Create tables for CSEM Journal

-- Table for journal volumes
CREATE TABLE public.journal_volumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  year INTEGER NOT NULL,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for journal issues (numéros)
CREATE TABLE public.journal_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id UUID REFERENCES public.journal_volumes(id) ON DELETE CASCADE NOT NULL,
  issue_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  publication_date DATE NOT NULL,
  pdf_url TEXT,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(volume_id, issue_number)
);

-- Table for published journal articles
CREATE TABLE public.journal_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.journal_issues(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  affiliations TEXT[],
  abstract TEXT NOT NULL,
  content TEXT,
  keywords TEXT[],
  doi TEXT,
  pdf_url TEXT,
  publication_date DATE NOT NULL,
  pages TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for article submissions
CREATE TABLE public.journal_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  affiliation TEXT NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT[],
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected')),
  reviewer_notes TEXT,
  certified_original BOOLEAN DEFAULT false,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for editorial committee
CREATE TABLE public.editorial_committee (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  affiliation TEXT,
  bio TEXT,
  photo_url TEXT,
  email TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journal_volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_committee ENABLE ROW LEVEL SECURITY;

-- RLS Policies for journal_volumes
CREATE POLICY "Everyone can view volumes" ON public.journal_volumes FOR SELECT USING (true);
CREATE POLICY "Admins can manage volumes" ON public.journal_volumes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for journal_issues
CREATE POLICY "Everyone can view issues" ON public.journal_issues FOR SELECT USING (true);
CREATE POLICY "Admins can manage issues" ON public.journal_issues FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for journal_articles
CREATE POLICY "Everyone can view articles" ON public.journal_articles FOR SELECT USING (true);
CREATE POLICY "Admins can manage articles" ON public.journal_articles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for journal_submissions
CREATE POLICY "Users can submit articles" ON public.journal_submissions FOR INSERT WITH CHECK (auth.uid() = submitter_id);
CREATE POLICY "Users can view their submissions" ON public.journal_submissions FOR SELECT USING (auth.uid() = submitter_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));
CREATE POLICY "Admins and editors can manage submissions" ON public.journal_submissions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- RLS Policies for editorial_committee
CREATE POLICY "Everyone can view committee" ON public.editorial_committee FOR SELECT USING (true);
CREATE POLICY "Admins can manage committee" ON public.editorial_committee FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_journal_volumes_updated_at BEFORE UPDATE ON public.journal_volumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_issues_updated_at BEFORE UPDATE ON public.journal_issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_articles_updated_at BEFORE UPDATE ON public.journal_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_submissions_updated_at BEFORE UPDATE ON public.journal_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_editorial_committee_updated_at BEFORE UPDATE ON public.editorial_committee FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Create article reviews table
CREATE TABLE public.article_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  abstract TEXT NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected', 'revision_requested')),
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_notes TEXT,
  decision_notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authors can view their own submissions"
  ON public.article_reviews
  FOR SELECT
  USING (auth.uid() = submitter_id OR auth.uid() = reviewer_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Authenticated users can submit articles"
  ON public.article_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Reviewers and admins can update reviews"
  ON public.article_reviews
  FOR UPDATE
  USING (auth.uid() = reviewer_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can delete reviews"
  ON public.article_reviews
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_article_reviews_updated_at
  BEFORE UPDATE ON public.article_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
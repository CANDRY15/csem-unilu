-- Add contact column to comite_central
ALTER TABLE public.comite_central 
ADD COLUMN IF NOT EXISTS contact VARCHAR;

-- Add logo column to departements
ALTER TABLE public.departements 
ADD COLUMN IF NOT EXISTS logo VARCHAR;

-- Create table for department members
CREATE TABLE IF NOT EXISTS public.membres_departement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  departement_id UUID REFERENCES public.departements(id) ON DELETE CASCADE,
  nom VARCHAR NOT NULL,
  fonction VARCHAR NOT NULL,
  niveau VARCHAR,
  photo VARCHAR,
  contact VARCHAR,
  bio TEXT,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update publications table
ALTER TABLE public.publications
ADD COLUMN IF NOT EXISTS authors TEXT,
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Create bibliotheque table
CREATE TABLE IF NOT EXISTS public.bibliotheque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titre VARCHAR NOT NULL,
  type VARCHAR NOT NULL, -- 'these', 'tp', 'cours', 'presentation'
  auteur VARCHAR NOT NULL,
  description TEXT,
  fichier_url VARCHAR NOT NULL,
  image_url VARCHAR,
  date_publication DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.membres_departement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bibliotheque ENABLE ROW LEVEL SECURITY;

-- RLS policies for membres_departement
CREATE POLICY "Everyone can view department members"
ON public.membres_departement FOR SELECT
USING (true);

CREATE POLICY "Admins can insert department members"
ON public.membres_departement FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update department members"
ON public.membres_departement FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete department members"
ON public.membres_departement FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for bibliotheque
CREATE POLICY "Everyone can view library content"
ON public.bibliotheque FOR SELECT
USING (true);

CREATE POLICY "Admins can insert library content"
ON public.bibliotheque FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update library content"
ON public.bibliotheque FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete library content"
ON public.bibliotheque FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('member-photos', 'member-photos', true),
  ('department-logos', 'department-logos', true),
  ('publication-files', 'publication-files', true),
  ('library-files', 'library-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for member-photos
CREATE POLICY "Public can view member photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-photos');

CREATE POLICY "Admins can upload member photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'member-photos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update member photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'member-photos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete member photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'member-photos' AND has_role(auth.uid(), 'admin'));

-- Storage policies for department-logos
CREATE POLICY "Public can view department logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'department-logos');

CREATE POLICY "Admins can upload department logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'department-logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update department logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'department-logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete department logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'department-logos' AND has_role(auth.uid(), 'admin'));

-- Storage policies for publication-files
CREATE POLICY "Public can view publication files"
ON storage.objects FOR SELECT
USING (bucket_id = 'publication-files');

CREATE POLICY "Admins can upload publication files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'publication-files' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor')));

CREATE POLICY "Admins can update publication files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'publication-files' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor')));

CREATE POLICY "Admins can delete publication files"
ON storage.objects FOR DELETE
USING (bucket_id = 'publication-files' AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor')));

-- Storage policies for library-files
CREATE POLICY "Public can view library files"
ON storage.objects FOR SELECT
USING (bucket_id = 'library-files');

CREATE POLICY "Admins can upload library files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'library-files' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update library files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'library-files' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete library files"
ON storage.objects FOR DELETE
USING (bucket_id = 'library-files' AND has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_membres_departement_updated_at
BEFORE UPDATE ON public.membres_departement
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bibliotheque_updated_at
BEFORE UPDATE ON public.bibliotheque
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
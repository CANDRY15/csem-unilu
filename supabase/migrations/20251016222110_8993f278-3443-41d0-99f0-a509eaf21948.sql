-- Create tables for organizational structure

-- Table for Comité Central members
CREATE TABLE public.comite_central (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  fonction VARCHAR(255) NOT NULL,
  niveau VARCHAR(50) NOT NULL,
  photo VARCHAR(500),
  description TEXT,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for Departments (directeur_nom is nullable for departments without a director yet)
CREATE TABLE public.departements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  directeur_nom VARCHAR(255),
  directeur_niveau VARCHAR(50),
  vice_nom VARCHAR(255),
  vice_niveau VARCHAR(50),
  photo VARCHAR(500),
  membres_count INTEGER DEFAULT 0,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comite_central ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comite_central
CREATE POLICY "Everyone can view comite central members"
ON public.comite_central
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert comite central members"
ON public.comite_central
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update comite central members"
ON public.comite_central
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete comite central members"
ON public.comite_central
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for departements
CREATE POLICY "Everyone can view departments"
ON public.departements
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert departments"
ON public.departements
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update departments"
ON public.departements
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete departments"
ON public.departements
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on comite_central
CREATE TRIGGER update_comite_central_updated_at
BEFORE UPDATE ON public.comite_central
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on departements
CREATE TRIGGER update_departements_updated_at
BEFORE UPDATE ON public.departements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data for Comité Central (2025-2026)
INSERT INTO public.comite_central (nom, fonction, niveau, ordre) VALUES
  ('Nshimbi Wa Mpende Élie', 'Président', 'M2', 1),
  ('Kibambe Ngongo Milca', 'Vice-présidente Administration & Finance', 'M1', 2),
  ('Mulowa Mulowa André', 'Vice-président Affaires Académiques', 'M2', 3),
  ('Saleh Lusangi Enock Caleb', 'Vice-président Affaires Extérieures', 'Bac3', 4);

-- Insert initial data for Departments
INSERT INTO public.departements (nom, directeur_nom, directeur_niveau, vice_nom, vice_niveau, ordre) VALUES
  ('DACAR', 'Kalonga Badipo Winner', 'M2', NULL, NULL, 1),
  ('Neuro-Psychiatrie', 'Agnès Bombo Muza', 'M1', 'Mupasa Monga Marie Ada', 'M2', 2),
  ('Médecine Interne, Pédiatrie et Spécialités', 'Kapinga Satwenge Salomon', NULL, NULL, NULL, 3),
  ('Physiologie et Sciences de Base', 'Batwa Kapezia John', 'M2', 'Nguz Sayikumba Vasco', NULL, 4),
  ('Santé Publique et Recherche', 'Chadrack Saidi Candry', 'M2', NULL, NULL, 5),
  ('Gynécologie-Obstétrique', NULL, NULL, 'Feza Mushila Nehemi', 'M1', 6);
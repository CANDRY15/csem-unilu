-- Create events table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  date date NOT NULL,
  time text,
  location text NOT NULL,
  price text,
  organizer text,
  cover_photo text,
  registration_link text,
  attendees integer,
  status text NOT NULL,
  type text NOT NULL DEFAULT 'upcoming',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create event_photos table for past events
CREATE TABLE public.event_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  caption text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Everyone can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert events"
  ON public.events FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for event_photos
CREATE POLICY "Everyone can view event photos"
  ON public.event_photos FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert event photos"
  ON public.event_photos FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update event photos"
  ON public.event_photos FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete event photos"
  ON public.event_photos FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for event photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-photos', 'event-photos', true);

-- Storage policies for event photos
CREATE POLICY "Event photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-photos');

CREATE POLICY "Admins can upload event photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update event photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'event-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete event photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-photos' AND has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
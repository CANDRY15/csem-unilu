import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Events = () => {
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("type", "upcoming")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: pastEvents = [] } = useQuery({
    queryKey: ["events", "past"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("type", "past")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: "Inscriptions ouvertes",
      limited: "Places limitées",
      soon: "Bientôt disponible",
      closed: "Complet",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  const PastEventCard = ({ event }: { event: any }) => {
    const [showPhotos, setShowPhotos] = useState(false);

    const { data: photos = [] } = useQuery({
      queryKey: ["event-photos", event.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("event_photos")
          .select("*")
          .eq("event_id", event.id);
        if (error) throw error;
        return data;
      },
      enabled: showPhotos,
    });

    return (
      <>
        <Card className="hover:shadow-lg transition-shadow">
          {event.cover_photo && (
            <div className="w-full h-48 overflow-hidden rounded-t-lg">
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-photos/${event.cover_photo}`}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDate(event.date)}</span>
              </div>
              {event.attendees && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" />
                  <span>{event.attendees} participants</span>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setShowPhotos(true)}>
              Voir les photos
            </Button>
          </CardContent>
        </Card>

        {showPhotos && (
          <Dialog open={showPhotos} onOpenChange={setShowPhotos}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{event.title}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id}>
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-photos/${photo.photo_url}`}
                      alt={photo.caption || "Event photo"}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {photo.caption && (
                      <p className="text-xs text-center mt-1">{photo.caption}</p>
                    )}
                  </div>
                ))}
                {photos.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground">
                    Aucune photo disponible pour cet événement
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Événements Académiques
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Participez à nos conférences, ateliers et journées scientifiques
          </p>
        </div>

        {/* Upcoming Events */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Événements à Venir</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-brand transition-all duration-300 hover:-translate-y-1"
              >
                {event.cover_photo && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-photos/${event.cover_photo}`}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{getStatusLabel(event.status)}</Badge>
                    {event.price && (
                      <Badge variant="outline">{event.price}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  {event.organizer && (
                    <p className="text-sm text-muted-foreground">Organisé par: {event.organizer}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-secondary" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-accent" />
                      <span>{event.location}</span>
                    </div>
                    {event.attendees && (
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <span>{event.attendees} participants attendus</span>
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  <Button
                    variant="hero"
                    className="w-full mt-4"
                    onClick={() => event.registration_link && window.open(event.registration_link, '_blank')}
                    disabled={!event.registration_link}
                  >
                    S'inscrire à l'événement
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Past Events */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Événements Passés</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <PastEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <Card className="mt-16 bg-gradient-to-br from-primary via-secondary to-accent">
          <CardContent className="p-8 text-center space-y-4 text-primary-foreground">
            <h3 className="text-2xl font-bold">Proposez un Événement</h3>
            <p className="opacity-90 max-w-2xl mx-auto">
              Vous avez une idée d'événement scientifique? Contactez-nous pour organiser ensemble!
            </p>
            <Button variant="secondary" size="lg">
              Nous Contacter
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Events;

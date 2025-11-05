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
        <Card className="group overflow-hidden hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
          {event.cover_photo && (
            <div className="relative w-full h-56 overflow-hidden">
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-photos/${event.cover_photo}`}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDate(event.date)}</span>
              </div>
              {event.attendees && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-secondary" />
                  <span>{event.attendees} participants</span>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" 
              onClick={() => setShowPhotos(true)}
            >
              Voir les photos
            </Button>
          </CardContent>
        </Card>

        {showPhotos && (
          <Dialog open={showPhotos} onOpenChange={setShowPhotos}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{event.title}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-lg">
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-photos/${photo.photo_url}`}
                      alt={photo.caption || "Event photo"}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-background/90 p-2">
                        <p className="text-xs text-center">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
                {photos.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-8">
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
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Événements à Venir
            </span>
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="group overflow-hidden hover:shadow-brand transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50"
              >
                {event.cover_photo && (
                  <div className="relative w-full h-64 overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-photos/${event.cover_photo}`}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
                        {getStatusLabel(event.status)}
                      </Badge>
                      {event.price && (
                        <Badge variant="outline" className="backdrop-blur-sm bg-background/80 font-semibold">
                          {event.price}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {event.title}
                  </CardTitle>
                  {event.organizer && (
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Organisé par: {event.organizer}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Date</p>
                        <p className="text-sm font-medium">{formatDate(event.date)}</p>
                      </div>
                    </div>
                    {event.time && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                        <Clock className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Heure</p>
                          <p className="text-sm font-medium">{event.time}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10 col-span-2">
                      <MapPin className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Lieu</p>
                        <p className="text-sm font-medium">{event.location}</p>
                      </div>
                    </div>
                    {event.attendees && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 col-span-2">
                        <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Participants</p>
                          <p className="text-sm font-medium">{event.attendees} personnes attendues</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {event.description}
                    </p>
                  )}
                  <Button
                    className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-opacity text-primary-foreground font-semibold py-6 text-base"
                    onClick={() => {
                      if (event.registration_link) {
                        window.open(event.registration_link, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    disabled={!event.registration_link}
                  >
                    S'inscrire à l'événement
                  </Button>
                </CardContent>
              </Card>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">Aucun événement à venir pour le moment</p>
              </div>
            )}
          </div>
        </section>

        {/* Past Events */}
        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Événements Passés
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <PastEventCard key={event.id} event={event} />
            ))}
            {pastEvents.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">Aucun événement passé disponible</p>
              </div>
            )}
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

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Share2, Facebook, Twitter, Linkedin, Mail, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";

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

  const shareEvent = (event: any, platform: string) => {
    const url = window.location.href;
    const text = `${event.title} - ${formatDate(event.date)} à ${event.location}`;
    
    let shareUrl = "";
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(text + " " + url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Lien copié dans le presse-papier!");
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const PastEventCard = ({ event }: { event: any }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [api, setApi] = useState<CarouselApi>();

    const { data: photos = [] } = useQuery({
      queryKey: ["event-photos", event.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("event_photos")
          .select("*")
          .eq("event_id", event.id)
          .limit(10);
        if (error) throw error;
        return data;
      },
    });

    // Auto-advance carousel every 5 seconds
    useEffect(() => {
      if (!api || photos.length === 0) return;

      const intervalId = setInterval(() => {
        api.scrollNext();
      }, 5000);

      return () => clearInterval(intervalId);
    }, [api, photos.length]);

    return (
      <>
        <Card className="group overflow-hidden border-2 border-border/50 hover:border-primary/50 hover:shadow-brand transition-all">
          <div className="aspect-[4/3] relative overflow-hidden">
            {photos.length > 0 ? (
              <Carousel className="w-full h-full" opts={{ loop: true }} setApi={setApi}>
                <CarouselContent>
                  {photos.map((photo, index) => (
                    <CarouselItem key={photo.id}>
                      <div className="relative h-full w-full aspect-[4/3]">
                        <img
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-photos/${photo.photo_url}`}
                          alt={photo.caption || `Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <p className="text-white text-sm">{photo.caption}</p>
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious 
                  className="left-2" 
                  onClick={(e) => e.stopPropagation()}
                />
                <CarouselNext 
                  className="right-2"
                  onClick={(e) => e.stopPropagation()}
                />
              </Carousel>
            ) : (
              <div className="w-full h-full bg-gradient-subtle flex items-center justify-center">
                <Calendar className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
          </div>
          
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            {photos.length > 0 && (
              <p className="text-sm text-primary font-semibold">
                {photos.length} photo{photos.length > 1 ? 's' : ''}
              </p>
            )}
            <Button 
              onClick={() => setShowDetails(true)}
              className="w-full mt-4"
              variant="outline"
            >
              Voir les détails
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Event Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-subtle rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-semibold">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lieu</p>
                    <p className="font-semibold">{event.location}</p>
                  </div>
                </div>
                {event.attendees && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Participants</p>
                      <p className="font-semibold">{event.attendees}</p>
                    </div>
                  </div>
                )}
                {event.organizer && (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Organisateur</p>
                      <p className="font-semibold">{event.organizer}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              )}

              {/* Photos Gallery */}
              {photos.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4">Galerie Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group/photo">
                        <img
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-photos/${photo.photo_url}`}
                          alt={photo.caption || `Photo ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover/photo:scale-110"
                        />
                        {photo.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover/photo:opacity-100 transition-opacity">
                            <p className="text-white text-xs">{photo.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Sharing */}
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-3">Partager cet événement</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareEvent(event, 'facebook')}
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareEvent(event, 'twitter')}
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareEvent(event, 'linkedin')}
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareEvent(event, 'email')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareEvent(event, 'copy')}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SEO
        title="Événements"
        description="Découvrez les événements scientifiques et académiques du CSEM: conférences, ateliers, séminaires médicaux à Lubumbashi. Inscrivez-vous aux prochains événements."
        keywords="événements médicaux Lubumbashi, conférences CSEM, séminaires médecine, ateliers médicaux, formation continue médecine"
        url="https://csem-unilu.org/events"
      />
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
                  <div className="space-y-3">
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
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        Partager:
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => shareEvent(event, "facebook")}
                      >
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => shareEvent(event, "twitter")}
                      >
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => shareEvent(event, "linkedin")}
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => shareEvent(event, "email")}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => shareEvent(event, "copy")}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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

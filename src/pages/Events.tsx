import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

const Events = () => {
  const upcomingEvents = [
    {
      title: "Conférence sur l'Intelligence Artificielle en Médecine",
      date: "25 Avril 2024",
      time: "14h00 - 17h00",
      location: "Amphithéâtre A, Faculté de Médecine",
      attendees: 150,
      status: "Inscriptions ouvertes",
    },
    {
      title: "Atelier de Recherche Clinique",
      date: "10 Mai 2024",
      time: "09h00 - 16h00",
      location: "Salle de Conférence B",
      attendees: 80,
      status: "Places limitées",
    },
    {
      title: "Journée Scientifique Annuelle CSEM",
      date: "15 Juin 2024",
      time: "08h00 - 18h00",
      location: "Campus Universitaire",
      attendees: 300,
      status: "Bientôt disponible",
    },
  ];

  const pastEvents = [
    {
      title: "Symposium sur la Santé Publique",
      date: "15 Février 2024",
      participants: 200,
    },
    {
      title: "Workshop: Techniques de Diagnostic Moderne",
      date: "10 Janvier 2024",
      participants: 120,
    },
  ];

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
            {upcomingEvents.map((event, index) => (
              <Card
                key={index}
                className="hover:shadow-brand transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">{event.status}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-secondary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-accent" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span>{event.attendees} participants attendus</span>
                    </div>
                  </div>
                  <Button variant="hero" className="w-full mt-4">
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
            {pastEvents.map((event, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-secondary" />
                      <span>{event.participants} participants</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Voir les photos
                  </Button>
                </CardContent>
              </Card>
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

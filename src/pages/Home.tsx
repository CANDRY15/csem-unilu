import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar, Users, Microscope, GraduationCap, Award, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const { data: featuredPublications } = useQuery({
    queryKey: ["featured-publications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("status", "published")
        .eq("featured", true)
        .order("published_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const features = [
    {
      icon: BookOpen,
      title: "Bibliothèque Numérique",
      description: "Accédez à une collection complète de thèses, travaux pratiques et cours médicaux",
      link: "/library",
    },
    {
      icon: Microscope,
      title: "Publications Scientifiques",
      description: "Découvrez les dernières recherches et innovations de nos étudiants",
      link: "/publications",
    },
    {
      icon: Calendar,
      title: "Événements Académiques",
      description: "Participez aux conférences, ateliers et journées scientifiques",
      link: "/events",
    },
    {
      icon: Users,
      title: "Communauté CSEM",
      description: "Rejoignez un réseau dynamique d'étudiants chercheurs passionnés",
      link: "/team",
    },
  ];

  const stats = [
    { number: "500+", label: "Étudiants Membres" },
    { number: "200+", label: "Publications" },
    { number: "50+", label: "Événements/An" },
    { number: "100+", label: "Documents" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Cellule Scientifique
              </span>
              <br />
              <span className="text-foreground">des Étudiants en Médecine</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Promouvoir la recherche scientifique, l'innovation et l'excellence académique à la Faculté
              de Médecine de l'Université de Lubumbashi
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/library">
                <Button variant="hero" size="lg" className="text-lg">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explorer la Bibliothèque
                </Button>
              </Link>
              <Link to="/publications">
                <Button variant="outline" size="lg" className="text-lg">
                  <Microscope className="mr-2 h-5 w-5" />
                  Nos Publications
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">Notre Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Le CSEM a pour mission de stimuler et valoriser la recherche scientifique menée par les
              étudiants en médecine. Nous créons un environnement propice à l'innovation, facilitons
              l'accès aux ressources académiques et encourageons la collaboration entre étudiants,
              enseignants et chercheurs.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold">Nos Services</h2>
            <p className="text-lg text-muted-foreground">
              Découvrez tout ce que le CSEM offre à ses membres
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link}>
                <Card className="h-full hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Publications */}
      {featuredPublications && featuredPublications.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold">À la Une</h2>
              <p className="text-lg text-muted-foreground">
                Nos dernières publications et événements en vedette
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPublications.map((pub) => (
                <div key={pub.id} className="group cursor-pointer space-y-3">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
                    {pub.cover_image ? (
                      <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/publication-files/${pub.cover_image}`}
                        alt={pub.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/400x600/1a1a1a/white?text=' + encodeURIComponent(pub.title);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center p-4">
                        <p className="text-center font-bold text-lg">{pub.title}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {pub.pdf_url && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => window.open(pub.pdf_url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {pub.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{pub.authors || "CSEM"}</p>
                    {pub.category && (
                      <p className="text-xs text-primary font-medium">{pub.category}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-bold">Nos Valeurs</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Excellence Académique</h3>
              <p className="text-muted-foreground">
                Nous visons la qualité et la rigueur dans toutes nos activités scientifiques
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Collaboration</h3>
              <p className="text-muted-foreground">
                Nous encourageons le partage des connaissances et le travail d'équipe
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Innovation</h3>
              <p className="text-muted-foreground">
                Nous promouvons la créativité et les approches nouvelles en médecine
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary via-secondary to-accent">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-primary-foreground">
            <h2 className="text-4xl font-bold">Rejoignez le CSEM</h2>
            <p className="text-lg opacity-90">
              Faites partie d'une communauté dynamique d'étudiants passionnés par la recherche et
              l'innovation en médecine
            </p>
            <Link to="/contact">
              <Button variant="secondary" size="lg" className="text-lg mt-4">
                Nous Contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

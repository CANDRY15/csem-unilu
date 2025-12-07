import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Users, Microscope, GraduationCap, Award, Download, FileText, Newspaper, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import studentsBackground from "@/assets/students-background.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";

const Home = () => {
  const [api, setApi] = useState<CarouselApi>();

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

  const { data: upcomingEvents } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("type", "upcoming")
        .order("date", { ascending: true })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const { data: libraryDocs } = useQuery({
    queryKey: ["library-docs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bibliotheque")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentArticles } = useQuery({
    queryKey: ["recent-journal-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_articles")
        .select("*")
        .order("publication_date", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  // Combine all items for carousel
  const carouselItems = [
    ...(featuredPublications?.map(item => ({ ...item, type: 'publication' as const })) || []),
    ...(upcomingEvents?.map(item => ({ ...item, type: 'event' as const })) || []),
    ...(libraryDocs?.map(item => ({ ...item, type: 'library' as const })) || []),
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Bibliothèque Numérique",
      description: "Accédez à une collection complète de thèses, travaux pratiques et cours médicaux",
      link: "/library",
    },
    {
      icon: FileText,
      title: "TFC/Mémoires",
      description: "Découvrez les travaux de fin de cycle et mémoires de nos étudiants",
      link: "/publications",
    },
    {
      icon: Newspaper,
      title: "CSEM Journal",
      description: "Notre revue scientifique avec des articles revus par les pairs",
      link: "/journal",
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
      <SEO
        title="Accueil - CSEM UNILU"
        description="La Cellule Scientifique des Etudiants en Médecine de l'Université de Lubumbashi. Publications médicales, événements scientifiques et ressources pour étudiants en médecine."
        keywords="CSEM, médecine Lubumbashi, UNILU, publications médicales, événements médicaux, bibliothèque médicale, recherche médicale Congo"
        url="https://csem-unilu.org"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${studentsBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95" />
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
              Club scientifique de la Faculté de Médecine créé depuis 2003, unique membre des CLEF (Clubs Leaders des Etudiants Francophones - AUF) à l'UNILU
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
                  <FileText className="mr-2 h-5 w-5" />
                  TFC/Mémoires
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section - Mobile Optimized */}
      <section className="py-8 px-4 bg-card/50 border-b border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Link to="/library" className="group">
              <Card className="h-full hover:shadow-brand transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-4 md:p-6 flex flex-col items-center text-center space-y-2 md:space-y-3">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">Bibliothèque</h3>
                  <p className="text-xs text-muted-foreground hidden md:block">Cours, TP, Thèses</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/publications" className="group">
              <Card className="h-full hover:shadow-brand transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                <CardContent className="p-4 md:p-6 flex flex-col items-center text-center space-y-2 md:space-y-3">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <FileText className="h-6 w-6 md:h-7 md:w-7 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">TFC/Mémoires</h3>
                  <p className="text-xs text-muted-foreground hidden md:block">Publications étudiantes</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/journal" className="group">
              <Card className="h-full hover:shadow-brand transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                <CardContent className="p-4 md:p-6 flex flex-col items-center text-center space-y-2 md:space-y-3">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Newspaper className="h-6 w-6 md:h-7 md:w-7 text-accent" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">CSEM Journal</h3>
                  <p className="text-xs text-muted-foreground hidden md:block">Revue scientifique</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/team" className="group">
              <Card className="h-full hover:shadow-brand transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-border">
                <CardContent className="p-4 md:p-6 flex flex-col items-center text-center space-y-2 md:space-y-3">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                    <Users className="h-6 w-6 md:h-7 md:w-7 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">Équipe</h3>
                  <p className="text-xs text-muted-foreground hidden md:block">Comité & Départements</p>
                </CardContent>
              </Card>
            </Link>
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
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Qui sommes-nous</h2>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-3xl p-8 md:p-12">
                <p className="text-lg md:text-xl text-foreground leading-relaxed">
                  La Cellule Scientifique des Etudiants en Médecine est un club scientifique au sein de la Faculté de Médecine de l&apos;Université de Lubumbashi, créé depuis 2003 par ceux qui sont aujourd&apos;hui nos éminents professeurs, CT et assistants. Ce club est l&apos;unique de l&apos;UNILU qui fait partie des CLEF (Clubs Leaders des Etudiants Francophones - AUF) depuis 5 bonnes années déjà. L&apos;objectif principal est celui de contribuer au développement du savoir, savoir-être, savoir-faire et savoir-faire-faire des carabins et des médecins, par la culture des échanges de connaissances médicales et par la recherche scientifique ; et cela s&apos;inscrit de manière directe dans les objectifs de l&apos;UNILU à travers la Faculté de Médecine.
                </p>
              </div>
            </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link}>
                <Card className="h-full hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-base md:text-xl font-semibold">{feature.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground hidden md:block">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Carousel */}
      {carouselItems.length > 0 && (
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold">À la Une</h2>
              <p className="text-lg text-muted-foreground">
                Publications, événements et ressources récents
              </p>
            </div>
            <Carousel setApi={setApi} className="w-full max-w-6xl mx-auto">
              <CarouselContent>
                {carouselItems.map((item, index) => (
                  <CarouselItem key={`${item.type}-${item.id}`} className="md:basis-1/2 lg:basis-1/3">
                    <Link 
                      to={
                        item.type === 'publication' ? '/publications' :
                        item.type === 'event' ? '/events' :
                        '/library'
                      }
                      className="group cursor-pointer block"
                    >
                      <div className="space-y-3">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
                          {item.type === 'publication' && (
                            <>
                              {item.cover_image ? (
                                <img
                                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/publication-files/${item.cover_image}`}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/400x600/1a1a1a/white?text=' + encodeURIComponent(item.title);
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center p-4">
                                  <p className="text-center font-bold text-lg">{item.title}</p>
                                </div>
                              )}
                              <div className="absolute top-2 right-2">
                                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                  Publication
                                </span>
                              </div>
                            </>
                          )}
                          {item.type === 'event' && (
                            <>
                              {item.cover_photo ? (
                                <img
                                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-photos/${item.cover_photo}`}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/400x600/1a1a1a/white?text=' + encodeURIComponent(item.title);
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-secondary/20 via-accent/20 to-primary/20 flex items-center justify-center p-4">
                                  <p className="text-center font-bold text-lg">{item.title}</p>
                                </div>
                              )}
                              <div className="absolute top-2 right-2">
                                <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
                                  Événement
                                </span>
                              </div>
                            </>
                          )}
                          {item.type === 'library' && (
                            <>
                              {item.image_url ? (
                                <img
                                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/library-files/${item.image_url}`}
                                  alt={item.titre}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/400x600/1a1a1a/white?text=' + encodeURIComponent(item.titre);
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-accent/20 via-primary/20 to-secondary/20 flex items-center justify-center p-4">
                                  <p className="text-center font-bold text-lg">{item.titre}</p>
                                </div>
                              )}
                              <div className="absolute top-2 right-2">
                                <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                                  Bibliothèque
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {item.type === 'library' ? item.titre : item.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {item.type === 'publication' && (item.authors || "CSEM")}
                            {item.type === 'event' && new Date(item.date).toLocaleDateString('fr-FR')}
                            {item.type === 'library' && item.auteur}
                          </p>
                          {item.type === 'publication' && item.category && (
                            <p className="text-xs text-primary font-medium">{item.category}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
      )}

      {/* Recent Journal Articles Section */}
      {recentArticles && recentArticles.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold">Articles Récents</h2>
                <p className="text-muted-foreground">Dernières publications du CSEM Journal</p>
              </div>
              <Link to="/journal">
                <Button variant="outline">
                  Voir tous les articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <Link 
                  key={article.id} 
                  to={`/article/${article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${article.id.replace(/-/g, '').substring(0, 8)}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Newspaper className="h-4 w-4 text-primary" />
                        <span>CSEM Journal</span>
                        <span>•</span>
                        <span>{new Date(article.publication_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {article.abstract}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {article.authors?.slice(0, 2).map((author, idx) => (
                          <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {author}
                          </span>
                        ))}
                        {article.authors && article.authors.length > 2 && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            +{article.authors.length - 2}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
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

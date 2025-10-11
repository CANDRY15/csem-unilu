import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";

const Publications = () => {
  const articles = [
    {
      title: "Innovations en Chirurgie Minimale Invasive",
      category: "Innovation",
      author: "Dr. Marie Kabongo",
      date: "15 Mars 2024",
      excerpt:
        "Une étude approfondie sur les nouvelles techniques chirurgicales réduisant les temps de récupération...",
    },
    {
      title: "Impact de la Télémédecine en Zone Rurale",
      category: "Santé Publique",
      author: "Jean Mukendi",
      date: "10 Mars 2024",
      excerpt:
        "Analyse des résultats d'un programme pilote de télémédecine dans les régions éloignées du Katanga...",
    },
    {
      title: "Digitalisation des Dossiers Médicaux",
      category: "Digitalisation",
      author: "Sarah Tshimanga",
      date: "5 Mars 2024",
      excerpt:
        "Étude sur l'implémentation d'un système de gestion électronique des dossiers patients...",
    },
    {
      title: "Nouvelles Approches en Immunologie",
      category: "Recherche",
      author: "David Mbuyi",
      date: "1 Mars 2024",
      excerpt:
        "Découvertes récentes sur les mécanismes de défense immunitaire et leurs applications cliniques...",
    },
  ];

  const categories = ["Tous", "Innovation", "Recherche", "Santé Publique", "Digitalisation"];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Publications Scientifiques
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez les travaux de recherche et innovations de nos étudiants et membres
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "Tous" ? "hero" : "outline"}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {articles.map((article, index) => (
            <Card
              key={index}
              className="hover:shadow-brand transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{article.category}</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {article.date}
                  </div>
                </div>
                <CardTitle className="text-2xl">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{article.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    {article.author}
                  </div>
                  <Button variant="ghost" className="group">
                    Lire plus
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="mt-16 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold">Publiez Votre Recherche</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vous avez mené une recherche intéressante? Partagez vos découvertes avec la communauté
              CSEM.
            </p>
            <Button variant="hero" size="lg">
              Soumettre un Article
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Publications;

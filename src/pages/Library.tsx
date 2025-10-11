import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, FileText, GraduationCap, Download } from "lucide-react";

const Library = () => {
  const categories = [
    { name: "Thèses", count: 45, icon: GraduationCap, color: "text-primary" },
    { name: "Travaux Pratiques", count: 78, icon: FileText, color: "text-secondary" },
    { name: "Cours", count: 120, icon: BookOpen, color: "text-accent" },
    { name: "Présentations", count: 56, icon: FileText, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Bibliothèque Numérique
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accédez à une collection complète de ressources académiques et travaux scientifiques
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="search"
              placeholder="Rechercher par titre, auteur, promotion..."
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((category, index) => (
            <Card
              key={index}
              className="hover:shadow-brand transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <category.icon className={`h-8 w-8 ${category.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                  <p className="text-muted-foreground">{category.count} documents</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Documents */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Documents Récents</h2>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl">Titre du Document Médical #{item}</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        Auteur: Étudiant Example | Promotion: 2023-2024
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Description courte du document. Ceci est un exemple de travail académique disponible
                    dans notre bibliothèque numérique...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold">Contribuez à la Bibliothèque</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vous avez réalisé un travail académique que vous souhaitez partager? Contactez-nous pour
              l'ajouter à notre collection.
            </p>
            <Button variant="hero">Soumettre un Document</Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Library;

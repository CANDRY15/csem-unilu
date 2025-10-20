import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, FileText, GraduationCap, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Library = () => {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["bibliotheque"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bibliotheque")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categories = [
    { name: "Thèses", count: documents?.filter(d => d.type === "these").length || 0, icon: GraduationCap, color: "text-primary" },
    { name: "Travaux Pratiques", count: documents?.filter(d => d.type === "tp").length || 0, icon: FileText, color: "text-secondary" },
    { name: "Cours", count: documents?.filter(d => d.type === "cours").length || 0, icon: BookOpen, color: "text-accent" },
    { name: "Présentations", count: documents?.filter(d => d.type === "presentation").length || 0, icon: FileText, color: "text-primary" },
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

        {/* Documents Grid */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Documents Récents</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : documents?.length === 0 ? (
              <div className="col-span-full">
                <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun document disponible</CardContent></Card>
              </div>
            ) : (
              documents?.map((doc) => (
                <div key={doc.id} className="group cursor-pointer space-y-3">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg hover:shadow-brand transition-all duration-300 hover:-translate-y-1">
                    {doc.image_url ? (
                      <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/library-files/${doc.image_url}`}
                        alt={doc.titre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/400x600/1a1a1a/white?text=' + encodeURIComponent(doc.titre);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center p-4">
                        <p className="text-center font-bold text-lg">{doc.titre}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => window.open(doc.fichier_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {doc.titre}
                    </h3>
                    <p className="text-xs text-muted-foreground">{doc.auteur}</p>
                  </div>
                </div>
              ))
            )}
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

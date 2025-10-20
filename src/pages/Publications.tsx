import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Publications = () => {
  const { data: publications, isLoading } = useQuery({
    queryKey: ["publications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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

        {/* Publications Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : publications?.length === 0 ? (
            <div className="col-span-full">
              <Card><CardContent className="p-8 text-center text-muted-foreground">Aucune publication disponible</CardContent></Card>
            </div>
          ) : (
            publications?.map((pub) => (
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
            ))
          )}
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

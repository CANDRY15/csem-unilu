import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, FileText, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const Publications = () => {
  const [selectedPublication, setSelectedPublication] = useState<any>(null);
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
              <div 
                key={pub.id} 
                className="group cursor-pointer space-y-3"
                onClick={() => setSelectedPublication(pub)}
              >
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {pub.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{pub.authors || "CSEM"}</p>
                  {pub.category && (
                    <Badge variant="secondary" className="text-xs">{pub.category}</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Publication Details Dialog */}
        <Dialog open={!!selectedPublication} onOpenChange={() => setSelectedPublication(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedPublication?.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {selectedPublication?.cover_image && (
                <div className="w-full max-w-md mx-auto">
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/publication-files/${selectedPublication.cover_image}`}
                    alt={selectedPublication.title}
                    className="w-full rounded-lg shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x600/1a1a1a/white?text=' + encodeURIComponent(selectedPublication.title);
                    }}
                  />
                </div>
              )}

              {selectedPublication?.authors && (
                <div className="text-center">
                  <p className="text-lg text-muted-foreground">
                    Par <span className="font-semibold">{selectedPublication.authors}</span>
                  </p>
                </div>
              )}

              {selectedPublication?.category && (
                <div className="flex justify-center">
                  <Badge variant="secondary" className="text-sm px-4 py-1">
                    {selectedPublication.category}
                  </Badge>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">Résumé</h3>
                <div className="prose max-w-none text-muted-foreground">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {selectedPublication?.excerpt || selectedPublication?.content}
                  </p>
                </div>
              </div>

              {selectedPublication?.pdf_url && (
                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-xl font-bold">Accéder au document complet</h3>
                  <p className="text-muted-foreground">
                    Pour consulter l'article complet au format électronique, cliquez sur le bouton ci-dessous pour accéder au document sur Google Drive.
                  </p>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-opacity text-primary-foreground font-semibold"
                    asChild
                  >
                    <a 
                      href={selectedPublication.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Ouvrir le document (Google Drive)
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Journal() {
  const { data: volumes, isLoading } = useQuery({
    queryKey: ["journal-volumes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_volumes")
        .select(`
          *,
          journal_issues (
            id,
            issue_number,
            title,
            publication_date,
            cover_image
          )
        `)
        .order("volume_number", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <SEO
        title="CSEM Journal - Revue Scientifique"
        description="Revue scientifique de la Cellule Scientifique des Etudiants en Médecine de l'Université de Lubumbashi. Articles scientifiques, recherches médicales et publications académiques."
        keywords="CSEM journal, revue scientifique, publications médicales, recherche médicale, articles scientifiques, UNILU"
      />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
        <Navigation />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              CSEM JOURNAL
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Revue Scientifique de la Cellule Scientifique des Etudiants en Médecine
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link to="/journal/soumettre">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardHeader>
                  <FileText className="w-12 h-12 text-primary mb-2" />
                  <CardTitle>Soumettre un Article</CardTitle>
                  <CardDescription>
                    Proposez votre manuscrit pour publication
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/journal/comite">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mb-2" />
                  <CardTitle>Comité Éditorial</CardTitle>
                  <CardDescription>
                    Découvrez notre équipe éditoriale
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/journal/instructions">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardHeader>
                  <BookOpen className="w-12 h-12 text-primary mb-2" />
                  <CardTitle>Instructions aux Auteurs</CardTitle>
                  <CardDescription>
                    Consignes de rédaction et soumission
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Volumes List */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center mb-6">Numéros Publiés</h2>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : volumes && volumes.length > 0 ? (
              <div className="space-y-8">
                {volumes.map((volume) => (
                  <Card key={volume.id} className="border-2">
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        Volume {volume.volume_number} - {volume.year}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {volume.title}
                      </CardDescription>
                      {volume.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {volume.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {volume.journal_issues && volume.journal_issues.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          {volume.journal_issues.map((issue: any) => (
                            <Link
                              key={issue.id}
                              to={`/journal/volume-${volume.volume_number}/numero-${issue.issue_number}`}
                            >
                              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardHeader>
                                  <CardTitle className="text-lg">
                                    Numéro {issue.issue_number}
                                  </CardTitle>
                                  <CardDescription>
                                    {issue.title}
                                  </CardDescription>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(issue.publication_date).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </CardHeader>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Aucun numéro publié dans ce volume.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Aucun numéro publié pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

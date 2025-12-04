import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, FileText, Users, Calendar, ChevronRight, Download, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Journal() {
  // Fetch volumes with issues
  const { data: volumes, isLoading: volumesLoading } = useQuery({
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
            cover_image,
            pdf_url
          )
        `)
        .order("volume_number", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent articles
  const { data: recentArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ["recent-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_articles")
        .select(`
          *,
          journal_issues (
            issue_number,
            journal_volumes (
              volume_number,
              year
            )
          )
        `)
        .order("publication_date", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Get featured articles (first 4 for editor's pick)
  const featuredArticles = recentArticles?.slice(0, 4) || [];
  const otherArticles = recentArticles?.slice(4) || [];

  return (
    <>
      <SEO
        title="CSEM Journal - Revue Scientifique"
        description="Revue scientifique de la Cellule Scientifique des Etudiants en Médecine de l'Université de Lubumbashi. Articles scientifiques, recherches médicales et publications académiques."
        keywords="CSEM journal, revue scientifique, publications médicales, recherche médicale, articles scientifiques, UNILU"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        
        <main className="flex-grow">
          {/* Hero Header */}
          <div className="bg-primary text-primary-foreground py-6">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  CSEM JOURNAL
                </h1>
                <div className="hidden md:flex items-center gap-4">
                  <Link to="/journal/soumettre">
                    <Button variant="secondary" size="sm">
                      Soumettre un article
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Journal Description */}
          <div className="border-b bg-card">
            <div className="container mx-auto px-4 py-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">
                Revue Scientifique de la CSEM
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-4xl">
                La revue scientifique de la Cellule Scientifique des Etudiants en Médecine (CSEM) publie des articles 
                originaux de recherche clinique, de santé publique et des sciences fondamentales réalisés par les étudiants 
                et praticiens de la Faculté de Médecine de l'Université de Lubumbashi. 
                <strong className="text-foreground"> Objectif:</strong> Promouvoir la culture de la recherche scientifique 
                et le partage des connaissances médicales.
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {/* Quick Navigation Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <Link to="/journal/soumettre" className="group">
                <Card className="h-full border-2 transition-all duration-200 hover:border-primary hover:shadow-md">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Soumettre un Article</h3>
                      <p className="text-sm text-muted-foreground">Proposez votre manuscrit</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/journal/comite" className="group">
                <Card className="h-full border-2 transition-all duration-200 hover:border-primary hover:shadow-md">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Comité Éditorial</h3>
                      <p className="text-sm text-muted-foreground">Notre équipe éditoriale</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/journal/instructions" className="group">
                <Card className="h-full border-2 transition-all duration-200 hover:border-primary hover:shadow-md">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Instructions aux Auteurs</h3>
                      <p className="text-sm text-muted-foreground">Guide de soumission</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Editor's Pick / Featured Articles */}
            {featuredArticles.length > 0 && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  À la une
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredArticles.map((article: any) => {
                    const issue = article.journal_issues;
                    const volume = issue?.journal_volumes;
                    return (
                      <Link key={article.id} to={`/journal/article/${article.id}`}>
                        <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-card">
                          {/* Category Header */}
                          <div className="bg-primary text-primary-foreground px-3 py-2 text-sm font-medium">
                            Recherche
                          </div>
                          
                          {/* Article Image Placeholder */}
                          <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/40 flex items-center justify-center">
                            <FileText className="w-12 h-12 text-primary/40" />
                          </div>
                          
                          {/* Article Content */}
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-sm leading-tight line-clamp-3 group-hover:text-primary transition-colors mb-2">
                              {article.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-1">
                              {article.authors?.slice(0, 2).join(", ")}{article.authors?.length > 2 ? " et al." : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(article.publication_date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Articles List */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Articles Récents
                </h2>
                
                {articlesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/4"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : recentArticles && recentArticles.length > 0 ? (
                  <div className="space-y-3">
                    {recentArticles.map((article: any) => {
                      const issue = article.journal_issues;
                      const volume = issue?.journal_volumes;
                      return (
                        <Link key={article.id} to={`/journal/article/${article.id}`}>
                          <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/50 border">
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                <Badge variant="secondary" className="shrink-0 h-fit">
                                  Recherche
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-2 mb-1">
                                    {article.title}
                                  </h3>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    {article.authors?.join(", ")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    CSEM J. {volume?.volume_number}({issue?.issue_number}). {new Date(article.publication_date).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Aucun article publié pour le moment.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar - Volumes */}
              <div>
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Numéros
                </h2>
                
                {volumesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-5 bg-muted rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : volumes && volumes.length > 0 ? (
                  <div className="space-y-4">
                    {volumes.map((volume) => (
                      <Card key={volume.id} className="border overflow-hidden">
                        <CardHeader className="p-4 pb-2 bg-secondary/30">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Volume {volume.volume_number} - {volume.year}
                          </CardTitle>
                          {volume.title && (
                            <CardDescription className="text-xs">
                              {volume.title}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-3">
                          {volume.journal_issues && volume.journal_issues.length > 0 ? (
                            <div className="space-y-2">
                              {volume.journal_issues.map((issue: any) => (
                                <Link
                                  key={issue.id}
                                  to={`/journal/volume-${volume.volume_number}/numero-${issue.issue_number}`}
                                  className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 transition-colors group"
                                >
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                      N° {issue.issue_number}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(issue.publication_date).toLocaleDateString('fr-FR', {
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              Aucun numéro publié
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center">
                      <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Aucun volume publié
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

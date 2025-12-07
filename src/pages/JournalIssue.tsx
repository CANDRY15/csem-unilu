import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ArrowLeft, Calendar, User, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getArticleUrl } from "@/lib/slugify";

export default function JournalIssue() {
  const { volumeNum, issueNum } = useParams<{ volumeNum: string; issueNum: string }>();
  
  const volumeNumber = parseInt(volumeNum || "0");
  const issueNumber = parseInt(issueNum || "0");

  const { data: issue, isLoading, error } = useQuery({
    queryKey: ["journal-issue", volumeNumber, issueNumber],
    queryFn: async () => {
      // First get the volume
      const { data: volume, error: volumeError } = await supabase
        .from("journal_volumes")
        .select("*")
        .eq("volume_number", volumeNumber)
        .maybeSingle();
      
      if (volumeError) throw volumeError;
      if (!volume) return null;

      // Then get the issue with articles
      const { data, error } = await supabase
        .from("journal_issues")
        .select(`
          *,
          journal_articles (
            id,
            title,
            authors,
            abstract,
            keywords,
            doi,
            pdf_url,
            pages,
            publication_date
          )
        `)
        .eq("volume_id", volume.id)
        .eq("issue_number", issueNumber)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return { ...data, volume };
    },
    enabled: volumeNumber > 0 && issueNumber > 0,
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background">
          <div className="bg-primary text-primary-foreground py-6">
            <div className="container mx-auto px-4">
              <Skeleton className="h-8 w-64 bg-primary-foreground/20" />
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!issue) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background">
          <div className="bg-primary text-primary-foreground py-6">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl font-bold">CSEM JOURNAL</h1>
            </div>
          </div>
          <div className="container mx-auto px-4 py-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Numéro non trouvé</h2>
            <Link to="/journal">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la revue
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${issue.title} - Volume ${volumeNumber}, Numéro ${issueNumber} | CSEM Journal`}
        description={issue.description || `Numéro ${issueNumber} du volume ${volumeNumber} de la revue scientifique CSEM`}
        keywords="CSEM journal, revue scientifique, publications médicales"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-6">
          <div className="container mx-auto px-4">
            <Link to="/journal" className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-3 text-sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour à la revue
            </Link>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-primary-foreground/80 text-sm mb-1">
                  Volume {volumeNumber} • Numéro {issueNumber}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {issue.title}
                </h1>
                <p className="text-primary-foreground/80 text-sm mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(issue.publication_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {issue.pdf_url && (
                <Button variant="secondary" size="sm" asChild className="shrink-0">
                  <a href={issue.pdf_url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    PDF Complet
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {issue.description && (
          <div className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <p className="text-muted-foreground">
                {issue.description}
              </p>
            </div>
          </div>
        )}

        <main className="flex-grow container mx-auto px-4 py-8">
          {/* Articles Count */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full"></span>
              Articles ({issue.journal_articles?.length || 0})
            </h2>
          </div>
          
          {issue.journal_articles && issue.journal_articles.length > 0 ? (
            <div className="space-y-4">
              {issue.journal_articles.map((article: any, index: number) => (
                <Link key={article.id} to={getArticleUrl(article.title, article.id)}>
                  <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary border overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Article Number */}
                        <div className="w-16 shrink-0 bg-primary/5 flex items-center justify-center border-r">
                          <span className="text-2xl font-bold text-primary/40">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>
                        
                        {/* Article Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start gap-3">
                            <Badge variant="secondary" className="shrink-0">
                              Recherche
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base leading-tight hover:text-primary transition-colors mb-2">
                                {article.title}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                                <User className="w-3 h-3" />
                                {article.authors.join(", ")}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {article.abstract}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                {article.pages && (
                                  <span>Pages {article.pages}</span>
                                )}
                                {article.doi && (
                                  <span className="text-primary">DOI: {article.doi}</span>
                                )}
                                {article.pdf_url && (
                                  <Badge variant="outline" className="text-xs">
                                    <Download className="w-3 h-3 mr-1" />
                                    PDF
                                  </Badge>
                                )}
                              </div>
                              
                              {article.keywords && article.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {article.keywords.slice(0, 4).map((keyword: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                  {article.keywords.length > 4 && (
                                    <span className="text-xs text-muted-foreground">
                                      +{article.keywords.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  Aucun article publié dans ce numéro.
                </p>
              </CardContent>
            </Card>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}

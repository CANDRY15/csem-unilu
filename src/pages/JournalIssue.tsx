import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function JournalIssue() {
  const { volumeNum, issueNum } = useParams<{ volumeNum: string; issueNum: string }>();
  
  const volumeNumber = parseInt(volumeNum || "0");
  const issueNumber = parseInt(issueNum || "0");

  const { data: issue, isLoading } = useQuery({
    queryKey: ["journal-issue", volumeNumber, issueNumber],
    queryFn: async () => {
      // First get the volume
      const { data: volume, error: volumeError } = await supabase
        .from("journal_volumes")
        .select("*")
        .eq("volume_number", volumeNumber)
        .single();
      
      if (volumeError) throw volumeError;

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
        .single();
      
      if (error) throw error;
      return { ...data, volume };
    },
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
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
        <div className="min-h-screen container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Numéro non trouvé</h1>
          <Link to="/journal">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la revue
            </Button>
          </Link>
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
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
        <Navigation />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <Link to="/journal">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la revue
            </Button>
          </Link>

          {/* Issue Header */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              Volume {volumeNumber} • Numéro {issueNumber}
            </p>
            <h1 className="text-4xl font-bold text-primary mb-4">
              {issue.title}
            </h1>
            {issue.description && (
              <p className="text-lg text-muted-foreground mb-4">
                {issue.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Publié le {new Date(issue.publication_date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            
            {issue.pdf_url && (
              <Button asChild className="mt-4">
                <a href={issue.pdf_url} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le numéro complet (PDF)
                </a>
              </Button>
            )}
          </div>

          {/* Articles List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Articles de ce numéro</h2>
            
            {issue.journal_articles && issue.journal_articles.length > 0 ? (
              <div className="space-y-4">
                {issue.journal_articles.map((article: any) => (
                  <Link key={article.id} to={`/journal/article/${article.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                      <CardHeader>
                        <CardTitle className="text-xl">{article.title}</CardTitle>
                        <CardDescription className="text-base">
                          {article.authors.join(", ")}
                        </CardDescription>
                        {article.pages && (
                          <p className="text-sm text-muted-foreground">
                            Pages {article.pages}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {article.abstract}
                        </p>
                        {article.keywords && article.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {article.keywords.map((keyword: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                        {article.doi && (
                          <p className="text-xs text-muted-foreground">
                            DOI: {article.doi}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Aucun article publié dans ce numéro.
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

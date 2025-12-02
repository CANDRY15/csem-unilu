import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function JournalArticle() {
  const { articleId } = useParams<{ articleId: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ["journal-article", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_articles")
        .select(`
          *,
          journal_issues (
            id,
            issue_number,
            title,
            publication_date,
            journal_volumes (
              volume_number,
              year
            )
          )
        `)
        .eq("id", articleId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Article non trouvé</h1>
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

  const issue = article.journal_issues as any;
  const volume = issue?.journal_volumes;

  return (
    <>
      <SEO
        title={`${article.title} | CSEM Journal`}
        description={article.abstract}
        keywords={article.keywords?.join(", ") || ""}
      />
      <Helmet>
        {/* Google Scholar meta tags */}
        <meta name="citation_title" content={article.title} />
        {article.authors.map((author: string, idx: number) => (
          <meta key={idx} name="citation_author" content={author} />
        ))}
        <meta name="citation_publication_date" content={new Date(article.publication_date).getFullYear().toString()} />
        <meta name="citation_journal_title" content="CSEM Journal - Revue Scientifique de la Cellule Scientifique des Etudiants en Médecine" />
        {article.pdf_url && <meta name="citation_pdf_url" content={article.pdf_url} />}
        {article.doi && <meta name="citation_doi" content={article.doi} />}
        {issue && (
          <>
            <meta name="citation_volume" content={volume?.volume_number?.toString() || ""} />
            <meta name="citation_issue" content={issue.issue_number?.toString() || ""} />
          </>
        )}
        {article.pages && <meta name="citation_firstpage" content={article.pages.split("-")[0]} />}
        {article.pages && article.pages.includes("-") && (
          <meta name="citation_lastpage" content={article.pages.split("-")[1]} />
        )}
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ScholarlyArticle",
            "headline": article.title,
            "author": article.authors.map((author: string) => ({
              "@type": "Person",
              "name": author
            })),
            "datePublished": article.publication_date,
            "abstract": article.abstract,
            "keywords": article.keywords?.join(", "),
            ...(article.doi && { "identifier": article.doi }),
            "isPartOf": {
              "@type": "PublicationIssue",
              "issueNumber": issue?.issue_number,
              "isPartOf": {
                "@type": "PublicationVolume",
                "volumeNumber": volume?.volume_number,
                "isPartOf": {
                  "@type": "Periodical",
                  "name": "CSEM Journal"
                }
              }
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
        <Navigation />
        
        <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
          <Link to={issue ? `/journal/volume-${volume?.volume_number}/numero-${issue.issue_number}` : "/journal"}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au numéro
            </Button>
          </Link>

          <article className="space-y-6">
            {/* Article Header */}
            <div className="space-y-4">
              {issue && volume && (
                <p className="text-sm text-muted-foreground">
                  CSEM Journal • Volume {volume.volume_number} • Numéro {issue.issue_number}
                </p>
              )}
              
              <h1 className="text-4xl font-bold leading-tight text-primary">
                {article.title}
              </h1>
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {article.authors.join(", ")}
                </p>
                {article.affiliations && article.affiliations.length > 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    {article.affiliations.join("; ")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Publié le {new Date(article.publication_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {article.pages && <span>• Pages {article.pages}</span>}
              </div>

              {article.doi && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">DOI:</span>
                  <a
                    href={`https://doi.org/${article.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {article.doi}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {article.pdf_url && (
                <Button asChild>
                  <a href={article.pdf_url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger l'article (PDF)
                  </a>
                </Button>
              )}
            </div>

            {/* Keywords */}
            {article.keywords && article.keywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mots-clés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((keyword: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Abstract */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {article.abstract}
                </p>
              </CardContent>
            </Card>

            {/* Content */}
            {article.content && (
              <Card>
                <CardHeader>
                  <CardTitle>Texte intégral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                    {article.content}
                  </div>
                </CardContent>
              </Card>
            )}
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}

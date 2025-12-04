import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, ArrowLeft, ExternalLink, Calendar, User, BookOpen, FileText, Share2 } from "lucide-react";
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
        <div className="min-h-screen bg-background">
          <div className="bg-primary text-primary-foreground py-6">
            <div className="container mx-auto px-4">
              <Skeleton className="h-8 w-64 bg-primary-foreground/20" />
            </div>
          </div>
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!article) {
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
            <h2 className="text-2xl font-bold mb-4">Article non trouvé</h2>
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
      
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-6">
          <div className="container mx-auto px-4">
            <Link 
              to={issue ? `/journal/volume-${volume?.volume_number}/numero-${issue.issue_number}` : "/journal"}
              className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-3 text-sm"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour au numéro
            </Link>
            <p className="text-primary-foreground/80 text-sm">
              CSEM Journal • Volume {volume?.volume_number} • Numéro {issue?.issue_number}
            </p>
          </div>
        </div>

        <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
          <article className="space-y-6">
            {/* Article Header */}
            <div className="space-y-4">
              <Badge>Recherche</Badge>
              
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">
                {article.title}
              </h1>
              
              {/* Authors */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                  <p className="text-base font-medium">
                    {article.authors.join(", ")}
                  </p>
                </div>
                {article.affiliations && article.affiliations.length > 0 && (
                  <p className="text-sm text-muted-foreground italic pl-6">
                    {article.affiliations.join("; ")}
                  </p>
                )}
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.publication_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {article.pages && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    Pages {article.pages}
                  </span>
                )}
              </div>

              {/* DOI */}
              {article.doi && (
                <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
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

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {article.pdf_url && (
                  <Button asChild>
                    <a href={article.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger PDF
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="icon" title="Partager">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Keywords */}
            {article.keywords && article.keywords.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Mots-clés
                </h2>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((keyword: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Abstract */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Résumé</CardTitle>
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Texte intégral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                    {article.content}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Citation */}
            <Card className="bg-secondary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Comment citer cet article
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {article.authors.join(", ")}. {article.title}. <em>CSEM Journal</em>. {volume?.year};{volume?.volume_number}({issue?.issue_number}):{article.pages || "xx-xx"}.
                  {article.doi && ` doi: ${article.doi}`}
                </p>
              </CardContent>
            </Card>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}

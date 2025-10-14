import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Loader2, FileText, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ArticleReview {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  status: string;
  submission_date: string;
  review_notes: string | null;
  decision_notes: string | null;
  pdf_url: string | null;
}

const MySubmissions = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isEditor } = useUserRole();
  const [submissions, setSubmissions] = useState<ArticleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<ArticleReview | null>(null);
  const [reviewData, setReviewData] = useState({
    status: "",
    review_notes: "",
    decision_notes: ""
  });

  const statusLabels: Record<string, string> = {
    pending: "En attente",
    under_review: "En révision",
    accepted: "Accepté",
    rejected: "Rejeté",
    revision_requested: "Révision demandée"
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    under_review: Eye,
    accepted: CheckCircle,
    rejected: XCircle,
    revision_requested: FileText
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user, isAdmin, isEditor]);

  const fetchSubmissions = async () => {
    try {
      let query = supabase
        .from("article_reviews")
        .select("*")
        .order("submission_date", { ascending: false });

      // Admins et éditeurs voient tous les articles, les autres seulement les leurs
      if (!isAdmin && !isEditor) {
        query = query.eq("submitter_id", user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des soumissions");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedArticle) return;

    try {
      const { error } = await supabase
        .from("article_reviews")
        .update({
          status: reviewData.status,
          review_notes: reviewData.review_notes,
          decision_notes: reviewData.decision_notes,
          reviewer_id: user?.id
        })
        .eq("id", selectedArticle.id);

      if (error) throw error;

      toast.success("Révision enregistrée avec succès!");
      setSelectedArticle(null);
      setReviewData({ status: "", review_notes: "", decision_notes: "" });
      fetchSubmissions();
    } catch (error: any) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {isAdmin || isEditor ? "Gestion des soumissions" : "Mes soumissions"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {submissions.length} soumission{submissions.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="hero" onClick={() => navigate("/article-review")}>
            <FileText className="mr-2 h-4 w-4" />
            Nouvelle soumission
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Articles soumis</CardTitle>
            <CardDescription>
              Suivez l'état de vos soumissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteurs</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucune soumission pour le moment
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((article) => {
                    const StatusIcon = statusIcons[article.status];
                    return (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>{article.authors}</TableCell>
                        <TableCell>
                          {new Date(article.submission_date).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={article.status === "accepted" ? "default" : "secondary"}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusLabels[article.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedArticle(article);
                                  setReviewData({
                                    status: article.status,
                                    review_notes: article.review_notes || "",
                                    decision_notes: article.decision_notes || ""
                                  });
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{article.title}</DialogTitle>
                                <DialogDescription>
                                  Par {article.authors}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Résumé</h3>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {article.abstract}
                                  </p>
                                </div>
                                
                                {article.pdf_url && (
                                  <div>
                                    <Button variant="outline" asChild>
                                      <a href={article.pdf_url} target="_blank" rel="noopener noreferrer">
                                        Voir le PDF
                                      </a>
                                    </Button>
                                  </div>
                                )}

                                {(isAdmin || isEditor) && (
                                  <div className="space-y-4 border-t pt-4">
                                    <h3 className="font-semibold">Révision</h3>
                                    <div className="space-y-2">
                                      <Label>Statut</Label>
                                      <Select
                                        value={reviewData.status}
                                        onValueChange={(value) => 
                                          setReviewData({ ...reviewData, status: value })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Object.entries(statusLabels).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                              {label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Notes de révision</Label>
                                      <Textarea
                                        value={reviewData.review_notes}
                                        onChange={(e) => 
                                          setReviewData({ ...reviewData, review_notes: e.target.value })
                                        }
                                        rows={4}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Notes de décision</Label>
                                      <Textarea
                                        value={reviewData.decision_notes}
                                        onChange={(e) => 
                                          setReviewData({ ...reviewData, decision_notes: e.target.value })
                                        }
                                        rows={4}
                                      />
                                    </div>
                                    <Button variant="hero" onClick={handleReview}>
                                      Enregistrer la révision
                                    </Button>
                                  </div>
                                )}

                                {article.review_notes && (
                                  <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-2">Notes du réviseur</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                      {article.review_notes}
                                    </p>
                                  </div>
                                )}

                                {article.decision_notes && (
                                  <div>
                                    <h3 className="font-semibold mb-2">Décision</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                      {article.decision_notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default MySubmissions;

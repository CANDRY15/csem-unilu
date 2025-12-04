import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Download, Eye, Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const JournalManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("volumes");

  // Fetch volumes
  const { data: volumes, isLoading: volumesLoading } = useQuery({
    queryKey: ["admin-journal-volumes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_volumes")
        .select("*")
        .order("volume_number", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch issues
  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ["admin-journal-issues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_issues")
        .select(`*, journal_volumes (volume_number)`)
        .order("publication_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch articles
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ["admin-journal-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_articles")
        .select(`*, journal_issues (issue_number, journal_volumes (volume_number))`)
        .order("publication_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ["admin-journal-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_submissions")
        .select("*")
        .order("submission_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch committee
  const { data: committee, isLoading: committeeLoading } = useQuery({
    queryKey: ["admin-editorial-committee"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("editorial_committee")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestion CSEM Journal</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="volumes">Volumes</TabsTrigger>
          <TabsTrigger value="issues">Numéros</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="submissions">Soumissions</TabsTrigger>
          <TabsTrigger value="committee">Comité</TabsTrigger>
        </TabsList>

        <TabsContent value="volumes" className="space-y-4">
          <VolumeManagement volumes={volumes} isLoading={volumesLoading} />
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <IssueManagement issues={issues} volumes={volumes} isLoading={issuesLoading} />
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <ArticleManagement articles={articles} issues={issues} isLoading={articlesLoading} />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <SubmissionManagement submissions={submissions} issues={issues} isLoading={submissionsLoading} />
        </TabsContent>

        <TabsContent value="committee" className="space-y-4">
          <CommitteeManagement committee={committee} isLoading={committeeLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Volume Management
function VolumeManagement({ volumes, isLoading }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    volume_number: "",
    year: new Date().getFullYear().toString(),
    title: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({ volume_number: "", year: new Date().getFullYear().toString(), title: "", description: "" });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      volume_number: item.volume_number.toString(),
      year: item.year.toString(),
      title: item.title,
      description: item.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        volume_number: parseInt(formData.volume_number),
        year: parseInt(formData.year),
        title: formData.title,
        description: formData.description || null,
      };

      if (editingItem) {
        const { error } = await supabase.from("journal_volumes").update(payload).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Volume mis à jour" });
      } else {
        const { error } = await supabase.from("journal_volumes").insert(payload);
        if (error) throw error;
        toast({ title: "Volume créé" });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-journal-volumes"] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce volume ?")) return;
    try {
      const { error } = await supabase.from("journal_volumes").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Volume supprimé" });
      queryClient.invalidateQueries({ queryKey: ["admin-journal-volumes"] });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Volumes</CardTitle>
          <CardDescription>Gérer les volumes de la revue</CardDescription>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Nouveau Volume
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volumes?.map((vol: any) => (
                <TableRow key={vol.id}>
                  <TableCell>{vol.volume_number}</TableCell>
                  <TableCell>{vol.title}</TableCell>
                  <TableCell>{vol.year}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(vol)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(vol.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!volumes?.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Aucun volume</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier le Volume" : "Nouveau Volume"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Numéro du volume</Label><Input type="number" value={formData.volume_number} onChange={(e) => setFormData({ ...formData, volume_number: e.target.value })} required /></div>
              <div><Label>Année</Label><Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} required /></div>
            </div>
            <div><Label>Titre</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <Button type="submit" className="w-full">{editingItem ? "Mettre à jour" : "Créer"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Issue Management
function IssueManagement({ issues, volumes, isLoading }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    volume_id: "",
    issue_number: "",
    title: "",
    description: "",
    publication_date: new Date().toISOString().split("T")[0],
    pdf_url: "",
  });

  const resetForm = () => {
    setFormData({ volume_id: "", issue_number: "", title: "", description: "", publication_date: new Date().toISOString().split("T")[0], pdf_url: "" });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      volume_id: item.volume_id,
      issue_number: item.issue_number.toString(),
      title: item.title,
      description: item.description || "",
      publication_date: item.publication_date,
      pdf_url: item.pdf_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        volume_id: formData.volume_id,
        issue_number: parseInt(formData.issue_number),
        title: formData.title,
        description: formData.description || null,
        publication_date: formData.publication_date,
        pdf_url: formData.pdf_url || null,
      };

      if (editingItem) {
        const { error } = await supabase.from("journal_issues").update(payload).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Numéro mis à jour" });
      } else {
        const { error } = await supabase.from("journal_issues").insert(payload);
        if (error) throw error;
        toast({ title: "Numéro créé" });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-journal-issues"] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce numéro ?")) return;
    try {
      const { error } = await supabase.from("journal_issues").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Numéro supprimé" });
      queryClient.invalidateQueries({ queryKey: ["admin-journal-issues"] });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Numéros</CardTitle>
          <CardDescription>Gérer les numéros de chaque volume</CardDescription>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Nouveau Numéro
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volume</TableHead>
                <TableHead>N°</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues?.map((issue: any) => (
                <TableRow key={issue.id}>
                  <TableCell>Vol. {issue.journal_volumes?.volume_number}</TableCell>
                  <TableCell>{issue.issue_number}</TableCell>
                  <TableCell>{issue.title}</TableCell>
                  <TableCell>{new Date(issue.publication_date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(issue)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(issue.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!issues?.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucun numéro</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier le Numéro" : "Nouveau Numéro"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Volume</Label>
              <Select value={formData.volume_id} onValueChange={(v) => setFormData({ ...formData, volume_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un volume" /></SelectTrigger>
                <SelectContent>
                  {volumes?.map((vol: any) => (
                    <SelectItem key={vol.id} value={vol.id}>Volume {vol.volume_number} - {vol.year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Numéro</Label><Input type="number" value={formData.issue_number} onChange={(e) => setFormData({ ...formData, issue_number: e.target.value })} required /></div>
              <div><Label>Date de publication</Label><Input type="date" value={formData.publication_date} onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })} required /></div>
            </div>
            <div><Label>Titre</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div><Label>URL du PDF complet</Label><Input value={formData.pdf_url} onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })} placeholder="https://..." /></div>
            <Button type="submit" className="w-full">{editingItem ? "Mettre à jour" : "Créer"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Article Management
function ArticleManagement({ articles, issues, isLoading }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    issue_id: "",
    title: "",
    authors: "",
    affiliations: "",
    abstract: "",
    keywords: "",
    publication_date: new Date().toISOString().split("T")[0],
    pdf_url: "",
    doi: "",
    pages: "",
  });

  const resetForm = () => {
    setFormData({ issue_id: "", title: "", authors: "", affiliations: "", abstract: "", keywords: "", publication_date: new Date().toISOString().split("T")[0], pdf_url: "", doi: "", pages: "" });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      issue_id: item.issue_id || "",
      title: item.title,
      authors: item.authors?.join(", ") || "",
      affiliations: item.affiliations?.join(", ") || "",
      abstract: item.abstract,
      keywords: item.keywords?.join(", ") || "",
      publication_date: item.publication_date,
      pdf_url: item.pdf_url || "",
      doi: item.doi || "",
      pages: item.pages || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        issue_id: formData.issue_id || null,
        title: formData.title,
        authors: formData.authors.split(",").map((a) => a.trim()).filter(Boolean),
        affiliations: formData.affiliations ? formData.affiliations.split(",").map((a) => a.trim()).filter(Boolean) : null,
        abstract: formData.abstract,
        keywords: formData.keywords ? formData.keywords.split(",").map((k) => k.trim()).filter(Boolean) : null,
        publication_date: formData.publication_date,
        pdf_url: formData.pdf_url || null,
        doi: formData.doi || null,
        pages: formData.pages || null,
      };

      if (editingItem) {
        const { error } = await supabase.from("journal_articles").update(payload).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Article mis à jour" });
      } else {
        const { error } = await supabase.from("journal_articles").insert(payload);
        if (error) throw error;
        toast({ title: "Article créé" });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-journal-articles"] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      const { error } = await supabase.from("journal_articles").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Article supprimé" });
      queryClient.invalidateQueries({ queryKey: ["admin-journal-articles"] });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Articles</CardTitle>
          <CardDescription>Gérer les articles publiés</CardDescription>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Nouvel Article
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Auteurs</TableHead>
                <TableHead>Numéro</TableHead>
                <TableHead>DOI</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles?.map((article: any) => (
                <TableRow key={article.id}>
                  <TableCell className="max-w-xs truncate">{article.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{article.authors?.join(", ")}</TableCell>
                  <TableCell>{article.journal_issues ? `Vol.${article.journal_issues.journal_volumes?.volume_number} N°${article.journal_issues.issue_number}` : "-"}</TableCell>
                  <TableCell>{article.doi || "-"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!articles?.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucun article</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier l'Article" : "Nouvel Article"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Numéro associé</Label>
              <Select value={formData.issue_id} onValueChange={(v) => setFormData({ ...formData, issue_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un numéro" /></SelectTrigger>
                <SelectContent>
                  {issues?.map((issue: any) => (
                    <SelectItem key={issue.id} value={issue.id}>Vol.{issue.journal_volumes?.volume_number} N°{issue.issue_number} - {issue.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Titre</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div><Label>Auteurs (séparés par des virgules)</Label><Input value={formData.authors} onChange={(e) => setFormData({ ...formData, authors: e.target.value })} required /></div>
            <div><Label>Affiliations (séparées par des virgules)</Label><Input value={formData.affiliations} onChange={(e) => setFormData({ ...formData, affiliations: e.target.value })} /></div>
            <div><Label>Résumé</Label><Textarea rows={4} value={formData.abstract} onChange={(e) => setFormData({ ...formData, abstract: e.target.value })} required /></div>
            <div><Label>Mots-clés (séparés par des virgules)</Label><Input value={formData.keywords} onChange={(e) => setFormData({ ...formData, keywords: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date de publication</Label><Input type="date" value={formData.publication_date} onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })} required /></div>
              <div><Label>Pages</Label><Input value={formData.pages} onChange={(e) => setFormData({ ...formData, pages: e.target.value })} placeholder="ex: 1-15" /></div>
            </div>
            <div><Label>URL du PDF</Label><Input value={formData.pdf_url} onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })} placeholder="https://..." /></div>
            <div><Label>DOI</Label><Input value={formData.doi} onChange={(e) => setFormData({ ...formData, doi: e.target.value })} placeholder="10.xxxx/csem.2025.xxx" /></div>
            <Button type="submit" className="w-full">{editingItem ? "Mettre à jour" : "Créer"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Submission Management
function SubmissionManagement({ submissions, issues, isLoading }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("journal_submissions").update({ status }).eq("id", id);
      if (error) throw error;
      toast({ title: "Statut mis à jour" });
      queryClient.invalidateQueries({ queryKey: ["admin-journal-submissions"] });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary">En attente</Badge>;
      case "in_review": return <Badge className="bg-yellow-500">En révision</Badge>;
      case "accepted": return <Badge className="bg-green-500">Accepté</Badge>;
      case "rejected": return <Badge variant="destructive">Refusé</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Soumissions d&apos;Articles</CardTitle>
        <CardDescription>Gérer les manuscrits soumis par les auteurs</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions?.map((sub: any) => (
                <TableRow key={sub.id}>
                  <TableCell className="max-w-xs truncate">{sub.title}</TableCell>
                  <TableCell>{sub.full_name}</TableCell>
                  <TableCell>{sub.email}</TableCell>
                  <TableCell>{new Date(sub.submission_date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell className="space-x-1">
                    {sub.file_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={sub.file_url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                      </Button>
                    )}
                    <Select value={sub.status} onValueChange={(v) => updateStatus(sub.id, v)}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="in_review">En révision</SelectItem>
                        <SelectItem value="accepted">Accepté</SelectItem>
                        <SelectItem value="rejected">Refusé</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {!submissions?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Aucune soumission</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Committee Management
function CommitteeManagement({ committee, isLoading }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    affiliation: "",
    email: "",
    bio: "",
    order_index: "0",
  });

  const resetForm = () => {
    setFormData({ name: "", role: "", affiliation: "", email: "", bio: "", order_index: "0" });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      affiliation: item.affiliation || "",
      email: item.email || "",
      bio: item.bio || "",
      order_index: item.order_index?.toString() || "0",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        role: formData.role,
        affiliation: formData.affiliation || null,
        email: formData.email || null,
        bio: formData.bio || null,
        order_index: parseInt(formData.order_index),
      };

      if (editingItem) {
        const { error } = await supabase.from("editorial_committee").update(payload).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Membre mis à jour" });
      } else {
        const { error } = await supabase.from("editorial_committee").insert(payload);
        if (error) throw error;
        toast({ title: "Membre ajouté" });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-editorial-committee"] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce membre ?")) return;
    try {
      const { error } = await supabase.from("editorial_committee").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Membre supprimé" });
      queryClient.invalidateQueries({ queryKey: ["admin-editorial-committee"] });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Comité Éditorial</CardTitle>
          <CardDescription>Gérer les membres du comité éditorial</CardDescription>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Nouveau Membre
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordre</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Affiliation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {committee?.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell>{member.order_index}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.affiliation || "-"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!committee?.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucun membre</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier le Membre" : "Nouveau Membre"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nom</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div><Label>Ordre d&apos;affichage</Label><Input type="number" value={formData.order_index} onChange={(e) => setFormData({ ...formData, order_index: e.target.value })} /></div>
            </div>
            <div><Label>Rôle</Label><Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required placeholder="ex: Rédacteur en chef" /></div>
            <div><Label>Affiliation</Label><Input value={formData.affiliation} onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
            <div><Label>Biographie</Label><Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} /></div>
            <Button type="submit" className="w-full">{editingItem ? "Mettre à jour" : "Ajouter"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default JournalManagement;

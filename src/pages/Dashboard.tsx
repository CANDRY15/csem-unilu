import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, FileText, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OrganizationManagement } from "@/components/OrganizationManagement";
import { DepartmentMembersManagement } from "@/components/DepartmentMembersManagement";
import { LibraryManagement } from "@/components/LibraryManagement";

interface Publication {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string;
  category: string | null;
  image_url: string | null;
  authors: string | null;
  pdf_url: string | null;
  cover_image: string | null;
  created_at: string;
  published_at: string | null;
  author_id: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useUserRole();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    image_url: "",
    authors: "",
    pdf_url: "",
    cover_image: "",
    status: "draft"
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPublications();
    }
  }, [user]);

  const fetchPublications = async () => {
    try {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPublications(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des publications");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const publicationData = {
        ...formData,
        author_id: user?.id,
        published_at: formData.status === "published" ? new Date().toISOString() : null
      };

      if (editingId) {
        const { error } = await supabase
          .from("publications")
          .update(publicationData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Publication mise à jour avec succès!");
      } else {
        const { error } = await supabase
          .from("publications")
          .insert(publicationData);

        if (error) throw error;
        toast.success("Publication créée avec succès!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPublications();
    } catch (error: any) {
      toast.error(error.message || "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (publication: Publication) => {
    setEditingId(publication.id);
    setFormData({
      title: publication.title,
      content: publication.content,
      excerpt: publication.excerpt || "",
      category: publication.category || "",
      image_url: publication.image_url || "",
      authors: publication.authors || "",
      pdf_url: publication.pdf_url || "",
      cover_image: publication.cover_image || "",
      status: publication.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette publication?")) return;

    try {
      const { error } = await supabase
        .from("publications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Publication supprimée");
      fetchPublications();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      category: "",
      image_url: "",
      authors: "",
      pdf_url: "",
      cover_image: "",
      status: "draft"
    });
    setEditingId(null);
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
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-2">Gérez vos publications et l'organisation</p>
        </div>

        <Tabs defaultValue="publications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="publications">
              <FileText className="h-4 w-4 mr-2" />
              Publications
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="organization">
                  <Users className="h-4 w-4 mr-2" />
                  Organisation
                </TabsTrigger>
                <TabsTrigger value="department-members">
                  <Users className="h-4 w-4 mr-2" />
                  Membres Depts
                </TabsTrigger>
                <TabsTrigger value="library">
                  <FileText className="h-4 w-4 mr-2" />
                  Bibliothèque
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="publications" className="space-y-6">
            <div className="flex justify-between items-center">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle publication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Modifier la publication" : "Nouvelle publication"}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations de votre publication
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Extrait</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authors">Auteurs</Label>
                  <Input
                    id="authors"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    placeholder="Ex: Dr. Jean Dupont, Prof. Marie Martin"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ex: Recherche, Événement..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="published">Publié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL de l'image</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover_image">URL de la couverture</Label>
                  <Input
                    id="cover_image"
                    type="url"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pdf_url">URL du PDF</Label>
                  <Input
                    id="pdf_url"
                    type="url"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="hero" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      editingId ? "Mettre à jour" : "Créer"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Toutes les publications</CardTitle>
            <CardDescription>
              {publications.length} publication{publications.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucune publication. Créez-en une pour commencer!
                    </TableCell>
                  </TableRow>
                ) : (
                  publications.map((pub) => (
                    <TableRow key={pub.id}>
                      <TableCell className="font-medium">{pub.title}</TableCell>
                      <TableCell>
                        {pub.category && (
                          <Badge variant="outline">{pub.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={pub.status === "published" ? "default" : "secondary"}>
                          {pub.status === "published" ? "Publié" : "Brouillon"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(pub.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(pub)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(pub.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <>
              <TabsContent value="organization">
                <OrganizationManagement />
              </TabsContent>
              
              <TabsContent value="department-members">
                <DepartmentMembersManagement />
              </TabsContent>
              
              <TabsContent value="library">
                <LibraryManagement />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;

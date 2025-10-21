import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Upload, Calendar, FileText } from "lucide-react";

interface Publication {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  status: string;
  category: string | null;
  authors: string | null;
  pdf_url: string | null;
  cover_image: string | null;
  type: string;
  featured: boolean;
  created_at: string;
  published_at: string | null;
}

export const PublicationManagement = () => {
  const { user } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"article" | "event" | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    authors: "",
    pdf_url: "",
    cover_image: "",
    status: "draft",
    type: "article",
    featured: false
  });

  useEffect(() => {
    fetchPublications();
  }, []);

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

  const handleTypeSelection = (type: "article" | "event") => {
    setSelectedType(type);
    setFormData({ ...formData, type });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image doit faire moins de 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("publication-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setFormData({ ...formData, cover_image: filePath });
      toast.success("Image téléchargée avec succès");
    } catch (error: any) {
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setUploading(false);
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
    setSelectedType(publication.type as "article" | "event");
    setFormData({
      title: publication.title,
      content: publication.content,
      excerpt: publication.excerpt || "",
      category: publication.category || "",
      authors: publication.authors || "",
      pdf_url: publication.pdf_url || "",
      cover_image: publication.cover_image || "",
      status: publication.status,
      type: publication.type,
      featured: publication.featured
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
      authors: "",
      pdf_url: "",
      cover_image: "",
      status: "draft",
      type: "article",
      featured: false
    });
    setEditingId(null);
    setSelectedType(null);
  };

  return (
    <div className="space-y-6">
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
                {!selectedType && !editingId 
                  ? "Choisissez le type de publication"
                  : "Remplissez les informations de votre publication"
                }
              </DialogDescription>
            </DialogHeader>

            {!selectedType && !editingId ? (
              <div className="grid grid-cols-2 gap-4 py-8">
                <Button
                  variant="outline"
                  className="h-32 flex-col gap-4 hover:border-primary"
                  onClick={() => handleTypeSelection("article")}
                >
                  <FileText className="h-12 w-12" />
                  <span className="text-lg font-semibold">Article</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-32 flex-col gap-4 hover:border-primary"
                  onClick={() => handleTypeSelection("event")}
                >
                  <Calendar className="h-12 w-12" />
                  <span className="text-lg font-semibold">Événement</span>
                </Button>
              </div>
            ) : (
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
                  <Label htmlFor="excerpt">Résumé court</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    placeholder="Un bref résumé pour l'aperçu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    {formData.type === "event" ? "Description de l'événement *" : "Contenu de l'article *"}
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authors">
                    {formData.type === "event" ? "Organisateurs" : "Auteurs"}
                  </Label>
                  <Input
                    id="authors"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    placeholder="Ex: Dr. Jean Dupont, Prof. Marie Martin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder={formData.type === "event" ? "Ex: Conférence, Atelier..." : "Ex: Recherche, Innovation..."}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_image">Image de couverture</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cover_image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>
                  {formData.cover_image && (
                    <p className="text-sm text-muted-foreground">✓ Image téléchargée</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf_url">Lien du document (Google Drive)</Label>
                  <Input
                    id="pdf_url"
                    type="url"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      Mettre à la une (afficher sur l'accueil)
                    </Label>
                  </div>
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
            )}
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
                <TableHead>Type</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>À la une</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucune publication. Créez-en une pour commencer!
                  </TableCell>
                </TableRow>
              ) : (
                publications.map((pub) => (
                  <TableRow key={pub.id}>
                    <TableCell className="font-medium">{pub.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {pub.type === "event" ? "Événement" : "Article"}
                      </Badge>
                    </TableCell>
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
                      {pub.featured && (
                        <Badge className="bg-accent">⭐ Une</Badge>
                      )}
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
    </div>
  );
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type LibraryItem = {
  id?: string;
  titre: string;
  type: string;
  auteur: string;
  description?: string;
  fichier_url: string;
  image_url?: string;
  date_publication?: string;
};

export function LibraryManagement() {
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["bibliotheque"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bibliotheque")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveItemMutation = useMutation({
    mutationFn: async (item: LibraryItem) => {
      if (item.id) {
        const { error } = await supabase
          .from("bibliotheque")
          .update(item)
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bibliotheque")
          .insert(item);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bibliotheque"] });
      setDialogOpen(false);
      setEditingItem(null);
      toast({ title: "Succès", description: "Document sauvegardé avec succès" });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bibliotheque")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bibliotheque"] });
      toast({ title: "Succès", description: "Document supprimé avec succès" });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let imageUrl = editingItem?.image_url;
    
    const imageFile = (formData.get("image") as File);
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('library-files')
        .upload(fileName, imageFile);
      
      if (error) {
        toast({ title: "Erreur", description: "Échec du téléchargement de l'image", variant: "destructive" });
        return;
      }
      imageUrl = data.path;
    }

    const fichierUrl = formData.get("fichier") as string;
    if (!fichierUrl) {
      toast({ title: "Erreur", description: "Le lien Drive est requis", variant: "destructive" });
      return;
    }

    const item: LibraryItem = {
      titre: formData.get("titre") as string,
      type: formData.get("type") as string,
      auteur: formData.get("auteur") as string,
      description: formData.get("description") as string,
      fichier_url: fichierUrl,
      image_url: imageUrl,
      date_publication: formData.get("date_publication") as string,
    };

    if (editingItem?.id) {
      item.id = editingItem.id;
    }

    saveItemMutation.mutate(item);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion de la Bibliothèque</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifier" : "Ajouter"} un document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre *</Label>
                <Input name="titre" defaultValue={editingItem?.titre} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select name="type" defaultValue={editingItem?.type || "these"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="these">Thèse</SelectItem>
                    <SelectItem value="tp">Travaux Pratiques</SelectItem>
                    <SelectItem value="cours">Cours</SelectItem>
                    <SelectItem value="presentation">Présentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auteur">Auteur *</Label>
                <Input name="auteur" defaultValue={editingItem?.auteur} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" defaultValue={editingItem?.description} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fichier">Lien Google Drive du document *</Label>
                <Input name="fichier" type="url" placeholder="https://drive.google.com/..." defaultValue={editingItem?.fichier_url} required />
                <p className="text-xs text-muted-foreground">Collez le lien de partage Google Drive du document</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image de couverture</Label>
                <Input name="image" type="file" accept="image/*" />
                {editingItem?.image_url && (
                  <p className="text-sm text-muted-foreground">Image actuelle: {editingItem.image_url}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_publication">Date de publication</Label>
                <Input name="date_publication" type="date" defaultValue={editingItem?.date_publication} />
              </div>
              <Button type="submit">Sauvegarder</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Chargement...</TableCell>
              </TableRow>
            ) : items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Aucun document</TableCell>
              </TableRow>
            ) : (
              items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.titre}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.auteur}</TableCell>
                  <TableCell>{item.date_publication || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingItem(item);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Supprimer ce document ?")) {
                            deleteItemMutation.mutate(item.id);
                          }
                        }}
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
  );
}
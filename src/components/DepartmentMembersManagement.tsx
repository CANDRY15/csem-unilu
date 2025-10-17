import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type DepartmentMember = {
  id?: string;
  departement_id: string;
  nom: string;
  fonction: string;
  niveau?: string;
  photo?: string;
  contact?: string;
  bio?: string;
  ordre?: number;
};

export function DepartmentMembersManagement() {
  const [editingMember, setEditingMember] = useState<DepartmentMember | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departements")
        .select("*")
        .order("ordre");
      if (error) throw error;
      return data;
    },
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ["department-members", selectedDept],
    queryFn: async () => {
      if (!selectedDept) return [];
      const { data, error } = await supabase
        .from("membres_departement")
        .select("*")
        .eq("departement_id", selectedDept)
        .order("ordre");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDept,
  });

  const saveMemberMutation = useMutation({
    mutationFn: async (member: DepartmentMember) => {
      if (member.id) {
        const { error } = await supabase
          .from("membres_departement")
          .update(member)
          .eq("id", member.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("membres_departement")
          .insert(member);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-members"] });
      setDialogOpen(false);
      setEditingMember(null);
      toast({ title: "Succès", description: "Membre sauvegardé avec succès" });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("membres_departement")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department-members"] });
      toast({ title: "Succès", description: "Membre supprimé avec succès" });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let photoUrl = editingMember?.photo;
    const photoFile = (formData.get("photo") as File);
    
    if (photoFile && photoFile.size > 0) {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('member-photos')
        .upload(fileName, photoFile);
      
      if (error) {
        toast({ title: "Erreur", description: "Échec du téléchargement de la photo", variant: "destructive" });
        return;
      }
      photoUrl = data.path;
    }

    const member: DepartmentMember = {
      departement_id: selectedDept,
      nom: formData.get("nom") as string,
      fonction: formData.get("fonction") as string,
      niveau: formData.get("niveau") as string,
      contact: formData.get("contact") as string,
      photo: photoUrl,
      bio: formData.get("bio") as string,
      ordre: parseInt(formData.get("ordre") as string) || 0,
    };

    if (editingMember?.id) {
      member.id = editingMember.id;
    }

    saveMemberMutation.mutate(member);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Membres de Département</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Sélectionner un département</Label>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un département" />
            </SelectTrigger>
            <SelectContent>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDept && (
          <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingMember(null)}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un membre
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingMember ? "Modifier" : "Ajouter"} un membre</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom complet *</Label>
                    <Input name="nom" defaultValue={editingMember?.nom} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fonction">Fonction *</Label>
                    <Input name="fonction" defaultValue={editingMember?.fonction} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niveau">Niveau académique</Label>
                    <Input name="niveau" defaultValue={editingMember?.niveau} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact</Label>
                    <Input name="contact" defaultValue={editingMember?.contact} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo">Photo</Label>
                    <Input name="photo" type="file" accept="image/*" />
                    {editingMember?.photo && (
                      <p className="text-sm text-muted-foreground">Photo actuelle: {editingMember.photo}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea name="bio" defaultValue={editingMember?.bio} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ordre">Ordre d'affichage</Label>
                    <Input name="ordre" type="number" defaultValue={editingMember?.ordre || 0} />
                  </div>
                  <Button type="submit">Sauvegarder</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Fonction</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Chargement...</TableCell>
                  </TableRow>
                ) : members?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Aucun membre</TableCell>
                  </TableRow>
                ) : (
                  members?.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.nom}</TableCell>
                      <TableCell>{member.fonction}</TableCell>
                      <TableCell>{member.niveau || "-"}</TableCell>
                      <TableCell>{member.contact || "-"}</TableCell>
                      <TableCell>{member.ordre}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingMember(member);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Supprimer ce membre ?")) {
                                deleteMemberMutation.mutate(member.id);
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Users, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ComiteMember = {
  id: string;
  nom: string;
  fonction: string;
  niveau: string;
  photo?: string;
  description?: string;
  ordre: number;
  contact?: string;
};

type Department = {
  id: string;
  nom: string;
  description?: string;
  directeur_nom?: string;
  directeur_niveau?: string;
  vice_nom?: string;
  vice_niveau?: string;
  photo?: string;
  logo?: string;
  membres_count: number;
  ordre: number;
};

export function OrganizationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingComite, setEditingComite] = useState<ComiteMember | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isComiteDialogOpen, setIsComiteDialogOpen] = useState(false);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);

  // Fetch Comité Central
  const { data: comiteMembers } = useQuery({
    queryKey: ["comite-central"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comite_central")
        .select("*")
        .order("ordre", { ascending: true });
      if (error) throw error;
      return data as ComiteMember[];
    },
  });

  // Fetch Departments
  const { data: departments } = useQuery({
    queryKey: ["departements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departements")
        .select("*")
        .order("ordre", { ascending: true });
      if (error) throw error;
      return data as Department[];
    },
  });

  // Mutations for Comité Central
  const saveComiteMutation = useMutation({
    mutationFn: async (member: Partial<ComiteMember>) => {
      console.log("Saving member:", member);
      if (member.id) {
        const { error } = await supabase
          .from("comite_central")
          .update(member as any)
          .eq("id", member.id);
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
      } else {
        const { error } = await supabase.from("comite_central").insert([member as any]);
        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comite-central"] });
      toast({ title: "Membre du comité sauvegardé avec succès" });
      setIsComiteDialogOpen(false);
      setEditingComite(null);
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({ 
        title: "Erreur lors de la sauvegarde", 
        description: error.message || "Une erreur est survenue",
        variant: "destructive" 
      });
    },
  });

  const deleteComiteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comite_central").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comite-central"] });
      toast({ title: "Membre supprimé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    },
  });

  // Mutations for Departments
  const saveDeptMutation = useMutation({
    mutationFn: async (dept: Partial<Department>) => {
      if (dept.id) {
        const { error } = await supabase
          .from("departements")
          .update(dept as any)
          .eq("id", dept.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("departements").insert([dept as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departements"] });
      toast({ title: "Département sauvegardé avec succès" });
      setIsDeptDialogOpen(false);
      setEditingDept(null);
    },
    onError: () => {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    },
  });

  const deleteDeptMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("departements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departements"] });
      toast({ title: "Département supprimé avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    },
  });

  const handleComiteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let photoUrl = editingComite?.photo;
    const photoFile = (formData.get("photo") as File);
    
    console.log("Photo file:", photoFile?.name, "size:", photoFile?.size);
    
    if (photoFile && photoFile.size > 0) {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      console.log("Uploading to:", fileName);
      
      const { data, error } = await supabase.storage
        .from('member-photos')
        .upload(fileName, photoFile);
      
      if (error) {
        console.error("Upload error:", error);
        toast({ 
          title: "Échec du téléchargement de la photo", 
          description: error.message,
          variant: "destructive" 
        });
        return;
      }
      console.log("Upload success, path:", data.path);
      photoUrl = data.path;
    }
    
    const member = {
      id: editingComite?.id,
      nom: formData.get("nom") as string,
      fonction: formData.get("fonction") as string,
      niveau: formData.get("niveau") as string,
      contact: formData.get("contact") as string || null,
      photo: photoUrl || null,
      description: formData.get("description") as string || null,
      ordre: parseInt(formData.get("ordre") as string) || 0,
    };
    console.log("Submitting member:", member);
    saveComiteMutation.mutate(member);
  };

  const handleDeptSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let logoUrl = editingDept?.logo;
    const logoFile = (formData.get("logo") as File);
    
    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('department-logos')
        .upload(fileName, logoFile);
      
      if (error) {
        toast({ title: "Échec du téléchargement du logo", variant: "destructive" });
        return;
      }
      logoUrl = data.path;
    }
    
    const dept = {
      id: editingDept?.id,
      nom: formData.get("nom") as string,
      description: formData.get("description") as string || null,
      photo: formData.get("photo") as string || null,
      logo: logoUrl || null,
      membres_count: 0,
      ordre: parseInt(formData.get("ordre") as string) || 0,
    };
    saveDeptMutation.mutate(dept);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion de l'Organisation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="comite">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comite">
              <Award className="h-4 w-4 mr-2" />
              Comité Central
            </TabsTrigger>
            <TabsTrigger value="departements">
              <Users className="h-4 w-4 mr-2" />
              Départements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comite" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isComiteDialogOpen} onOpenChange={setIsComiteDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingComite(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un membre
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingComite ? "Modifier le membre" : "Ajouter un membre"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleComiteSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nom">Nom complet *</Label>
                        <Input
                          id="nom"
                          name="nom"
                          defaultValue={editingComite?.nom}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="fonction">Fonction *</Label>
                        <Input
                          id="fonction"
                          name="fonction"
                          defaultValue={editingComite?.fonction}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="niveau">Niveau *</Label>
                        <Input
                          id="niveau"
                          name="niveau"
                          defaultValue={editingComite?.niveau}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact">Contact</Label>
                        <Input
                          id="contact"
                          name="contact"
                          defaultValue={editingComite?.contact}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ordre">Ordre d'affichage</Label>
                        <Input
                          id="ordre"
                          name="ordre"
                          type="number"
                          defaultValue={editingComite?.ordre || 0}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="photo">Photo</Label>
                      <Input
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/*"
                      />
                      {editingComite?.photo && (
                        <p className="text-xs text-muted-foreground mt-1">Photo actuelle disponible</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingComite?.description}
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Sauvegarder
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Fonction</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comiteMembers?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.nom}</TableCell>
                    <TableCell>{member.fonction}</TableCell>
                    <TableCell>{member.niveau}</TableCell>
                    <TableCell>{member.contact || "-"}</TableCell>
                    <TableCell>{member.ordre}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingComite(member);
                          setIsComiteDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteComiteMutation.mutate(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="departements" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingDept(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un département
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDept ? "Modifier le département" : "Ajouter un département"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleDeptSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nom">Nom du département *</Label>
                      <Input
                        id="nom"
                        name="nom"
                        defaultValue={editingDept?.nom}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description / Coordonnées</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingDept?.description}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ordre">Ordre d'affichage</Label>
                        <Input
                          id="ordre"
                          name="ordre"
                          type="number"
                          defaultValue={editingDept?.ordre || 0}
                        />
                      </div>
                    </div>
                     <div>
                       <Label htmlFor="photo">URL Photo</Label>
                       <Input
                         id="photo"
                         name="photo"
                         type="url"
                         defaultValue={editingDept?.photo}
                       />
                     </div>
                     <div>
                       <Label htmlFor="logo">Logo du département</Label>
                       <Input
                         id="logo"
                         name="logo"
                         type="file"
                         accept="image/*"
                       />
                       {editingDept?.logo && (
                         <p className="text-xs text-muted-foreground mt-1">Logo actuel disponible</p>
                       )}
                     </div>
                     <Button type="submit" className="w-full">
                       Sauvegarder
                     </Button>
                   </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Logo</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Membres</TableHead>
                  <TableHead>Ordre</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments?.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.nom}</TableCell>
                    <TableCell>
                      {dept.logo ? (
                        <img
                          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/department-logos/${dept.logo}`}
                          alt={dept.nom}
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{dept.description || "-"}</TableCell>
                    <TableCell>{dept.membres_count || 0}</TableCell>
                    <TableCell>{dept.ordre}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingDept(dept);
                          setIsDeptDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDeptMutation.mutate(dept.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

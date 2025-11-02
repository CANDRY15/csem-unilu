import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const EventsManagement = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventType, setEventType] = useState<"upcoming" | "past">("upcoming");
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedEventForPhotos, setSelectedEventForPhotos] = useState<any>(null);

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: eventPhotos } = useQuery({
    queryKey: ["event-photos", selectedEventForPhotos?.id],
    queryFn: async () => {
      if (!selectedEventForPhotos?.id) return [];
      const { data, error } = await supabase
        .from("event_photos")
        .select("*")
        .eq("event_id", selectedEventForPhotos.id);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedEventForPhotos?.id,
  });

  const saveEventMutation = useMutation({
    mutationFn: async (event: any) => {
      if (event.id) {
        const { error } = await supabase
          .from("events")
          .update(event)
          .eq("id", event.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(event);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Événement enregistré avec succès");
      setIsDialogOpen(false);
      setEditingEvent(null);
    },
    onError: (error: any) => {
      toast.error("Erreur lors de l'enregistrement: " + error.message);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Événement supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });

  const addPhotoMutation = useMutation({
    mutationFn: async (photo: { event_id: string; photo_url: string; caption?: string }) => {
      const { error } = await supabase.from("event_photos").insert(photo);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-photos"] });
      toast.success("Photo ajoutée avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de l'ajout de la photo: " + error.message);
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase.from("event_photos").delete().eq("id", photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-photos"] });
      toast.success("Photo supprimée avec succès");
    },
  });

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let coverPhotoUrl = editingEvent?.cover_photo || null;
    const coverPhotoFile = formData.get("cover_photo") as File;
    
    if (coverPhotoFile && coverPhotoFile.size > 0) {
      const fileExt = coverPhotoFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from("event-photos")
        .upload(fileName, coverPhotoFile);

      if (uploadError) {
        toast.error("Erreur lors du téléchargement de la photo");
        return;
      }
      coverPhotoUrl = data.path;
    }

    const event: any = {
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string || null,
      location: formData.get("location") as string,
      price: formData.get("price") as string || null,
      organizer: formData.get("organizer") as string || null,
      registration_link: formData.get("registration_link") as string || null,
      attendees: parseInt(formData.get("attendees") as string) || null,
      status: formData.get("status") as string,
      type: eventType,
      description: formData.get("description") as string || null,
      cover_photo: coverPhotoUrl,
    };

    if (editingEvent?.id) {
      event.id = editingEvent.id;
    }

    saveEventMutation.mutate(event);
  };

  const handlePhotoUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const photoFile = formData.get("photo") as File;
    const caption = formData.get("caption") as string;

    if (!photoFile || photoFile.size === 0) {
      toast.error("Veuillez sélectionner une photo");
      return;
    }

    const fileExt = photoFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage
      .from("event-photos")
      .upload(fileName, photoFile);

    if (uploadError) {
      toast.error("Erreur lors du téléchargement de la photo");
      return;
    }

    addPhotoMutation.mutate({
      event_id: selectedEventForPhotos.id,
      photo_url: data.path,
      caption: caption || undefined,
    });

    (e.target as HTMLFormElement).reset();
  };

  const openDialog = (event?: any, type: "upcoming" | "past" = "upcoming") => {
    setEditingEvent(event || null);
    setEventType(event?.type || type);
    setIsDialogOpen(true);
  };

  const openPhotoDialog = (event: any) => {
    setSelectedEventForPhotos(event);
    setIsPhotoDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Événements</h2>
        <div className="flex gap-2">
          <Button onClick={() => openDialog(undefined, "upcoming")}>
            <Plus className="mr-2 h-4 w-4" />
            Événement à Venir
          </Button>
          <Button onClick={() => openDialog(undefined, "past")} variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Événement Passé
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Événements à Venir</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {events?.filter((e) => e.type === "upcoming").map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{event.title}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openDialog(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteEventMutation.mutate(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {event.date} | {event.location}
                </p>
                {event.price && <p className="text-sm">Prix: {event.price}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Événements Passés</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {events?.filter((e) => e.type === "past").map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{event.title}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openPhotoDialog(event)}>
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openDialog(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteEventMutation.mutate(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {event.date} | {event.attendees} participants
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Modifier" : "Ajouter"} un Événement {eventType === "upcoming" ? "à Venir" : "Passé"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEventSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingEvent?.title}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={editingEvent?.date}
                  required
                />
              </div>
              {eventType === "upcoming" && (
                <div>
                  <Label htmlFor="time">Heure</Label>
                  <Input
                    id="time"
                    name="time"
                    placeholder="14h00 - 17h00"
                    defaultValue={editingEvent?.time}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="location">Lieu *</Label>
              <Input
                id="location"
                name="location"
                defaultValue={editingEvent?.location}
                required
              />
            </div>

            {eventType === "upcoming" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Prix</Label>
                    <Input
                      id="price"
                      name="price"
                      placeholder="Gratuit / 5000 FCFA"
                      defaultValue={editingEvent?.price}
                    />
                  </div>
                  <div>
                    <Label htmlFor="organizer">Organisateur</Label>
                    <Input
                      id="organizer"
                      name="organizer"
                      defaultValue={editingEvent?.organizer}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="registration_link">Lien d'inscription</Label>
                  <Input
                    id="registration_link"
                    name="registration_link"
                    type="url"
                    placeholder="https://..."
                    defaultValue={editingEvent?.registration_link}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Statut *</Label>
                  <Select name="status" defaultValue={editingEvent?.status || "open"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Inscriptions ouvertes</SelectItem>
                      <SelectItem value="limited">Places limitées</SelectItem>
                      <SelectItem value="soon">Bientôt disponible</SelectItem>
                      <SelectItem value="closed">Complet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="attendees">Nombre de participants</Label>
              <Input
                id="attendees"
                name="attendees"
                type="number"
                defaultValue={editingEvent?.attendees}
              />
            </div>

            <div>
              <Label htmlFor="cover_photo">Photo de couverture</Label>
              <Input
                id="cover_photo"
                name="cover_photo"
                type="file"
                accept="image/*"
              />
              {editingEvent?.cover_photo && (
                <p className="text-sm text-muted-foreground mt-1">Photo actuelle: {editingEvent.cover_photo}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingEvent?.description}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saveEventMutation.isPending}>
                {saveEventMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Photos de l'événement: {selectedEventForPhotos?.title}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handlePhotoUpload} className="space-y-4 border-b pb-4">
            <div>
              <Label htmlFor="photo">Ajouter une photo</Label>
              <Input id="photo" name="photo" type="file" accept="image/*" required />
            </div>
            <div>
              <Label htmlFor="caption">Légende (optionnel)</Label>
              <Input id="caption" name="caption" placeholder="Description de la photo" />
            </div>
            <Button type="submit" disabled={addPhotoMutation.isPending}>
              {addPhotoMutation.isPending ? "Téléchargement..." : "Ajouter la photo"}
            </Button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {eventPhotos?.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-photos/${photo.photo_url}`}
                  alt={photo.caption || "Event photo"}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deletePhotoMutation.mutate(photo.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {photo.caption && (
                  <p className="text-xs text-center mt-1">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

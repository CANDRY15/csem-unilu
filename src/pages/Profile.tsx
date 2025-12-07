import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Camera, User, Mail, Edit, Save, X } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<{
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        bio: data.bio || "",
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user!.id}.${fileExt}`;

    setUploading(true);
    try {
      // Delete old avatar if exists
      if (profile?.avatar_url) {
        await supabase.storage.from("member-photos").remove([profile.avatar_url]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: fileName })
        .eq("id", user!.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: fileName } : null);
      toast.success("Photo de profil mise à jour!");
    } catch (error: any) {
      toast.error("Erreur lors du téléchargement de l'image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
        })
        .eq("id", user!.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      toast.success("Profil mis à jour!");
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = () => {
    if (profile?.avatar_url) {
      return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-photos/${profile.avatar_url}`;
    }
    return null;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <SEO
        title={`${profile?.full_name || "Profil"} - CSEM UNILU`}
        description={`Profil de ${profile?.full_name || "membre"} sur la plateforme CSEM UNILU. ${profile?.bio || ""}`}
        keywords="profil membre CSEM, étudiant médecine Lubumbashi"
      />
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={getAvatarUrl() || undefined} alt={profile?.full_name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center cursor-pointer transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-primary-foreground" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {profile?.full_name || "Utilisateur"}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                {user?.email}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nom complet</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Parlez-nous de vous..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Enregistrer
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          full_name: profile?.full_name || "",
                          bio: profile?.bio || "",
                        });
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Nom complet</h3>
                    <p className="text-lg">{profile?.full_name || "Non défini"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Biographie</h3>
                    <p className="text-muted-foreground">{profile?.bio || "Aucune biographie définie"}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier le profil
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;

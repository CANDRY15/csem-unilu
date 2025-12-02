import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function JournalSubmit() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    affiliation: "",
    title: "",
    abstract: "",
    keywords: "",
    certified: false,
  });
  const [file, setFile] = useState<File | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF ou DOCX",
        variant: "destructive",
      });
      return;
    }

    if (!formData.certified) {
      toast({
        title: "Erreur",
        description: "Vous devez certifier que l'article est original",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("publication-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("publication-files")
        .getPublicUrl(fileName);

      // Submit to database
      const { error: dbError } = await supabase
        .from("journal_submissions")
        .insert({
          submitter_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          affiliation: formData.affiliation,
          title: formData.title,
          abstract: formData.abstract,
          keywords: formData.keywords.split(",").map(k => k.trim()),
          file_url: publicUrl,
          certified_original: formData.certified,
        });

      if (dbError) throw dbError;

      toast({
        title: "Soumission réussie",
        description: "Votre article a été soumis avec succès. Vous recevrez une confirmation par email.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting article:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la soumission",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Soumettre un Article | CSEM Journal"
        description="Soumettez votre manuscrit scientifique pour publication dans le CSEM Journal"
      />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
        <Navigation />
        
        <main className="flex-grow container mx-auto px-4 py-12 max-w-3xl">
          <Link to="/journal">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la revue
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Soumettre un Article</CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous pour soumettre votre manuscrit pour publication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet *</Label>
                  <Input
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="affiliation">Affiliation institutionnelle *</Label>
                  <Input
                    id="affiliation"
                    required
                    placeholder="Ex: Université de Lubumbashi, Faculté de Médecine"
                    value={formData.affiliation}
                    onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre du manuscrit *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Résumé (150-300 mots) *</Label>
                  <Textarea
                    id="abstract"
                    required
                    rows={6}
                    placeholder="Résumé de votre article..."
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.abstract.split(/\s+/).filter(Boolean).length} mots
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Mots-clés *</Label>
                  <Input
                    id="keywords"
                    required
                    placeholder="Séparez les mots-clés par des virgules"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Fichier du manuscrit (PDF ou DOCX) *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.docx"
                      required
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Fichier sélectionné: {file.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="certified"
                    checked={formData.certified}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, certified: checked as boolean })
                    }
                  />
                  <Label htmlFor="certified" className="text-sm font-normal cursor-pointer">
                    Je certifie que cet article est original et n'a pas été publié ailleurs *
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Soumission en cours...
                    </>
                  ) : (
                    "Soumettre l'article"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
}

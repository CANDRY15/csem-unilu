import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Upload, FileText, CheckCircle } from "lucide-react";

interface ArticleSubmissionFormProps {
  userId: string;
  userEmail: string;
}

export function ArticleSubmissionForm({ userId, userEmail }: ArticleSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: userEmail,
    affiliation: "",
    title: "",
    abstract: "",
    keywords: "",
    certified: false,
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Veuillez sélectionner un fichier PDF ou DOCX");
      return;
    }

    if (!formData.certified) {
      toast.error("Vous devez certifier que l'article est original");
      return;
    }

    if (formData.abstract.split(/\s+/).filter(Boolean).length < 150) {
      toast.error("Le résumé doit contenir au moins 150 mots");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
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
          submitter_id: userId,
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

      toast.success("Votre article a été soumis avec succès!");
      setSubmitted(true);
      
      // Reset form
      setFormData({
        fullName: "",
        email: userEmail,
        affiliation: "",
        title: "",
        abstract: "",
        keywords: "",
        certified: false,
      });
      setFile(null);
    } catch (error: any) {
      console.error("Error submitting article:", error);
      toast.error(error.message || "Une erreur est survenue lors de la soumission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Soumission réussie!</h3>
          <p className="text-muted-foreground mb-6">
            Votre article a été soumis avec succès. Vous recevrez une notification concernant l'état de votre soumission.
          </p>
          <Button onClick={() => setSubmitted(false)}>
            Soumettre un autre article
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Soumettre un Article au CSEM Journal
        </CardTitle>
        <CardDescription>
          Remplissez le formulaire ci-dessous pour soumettre votre manuscrit scientifique pour publication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet *</Label>
              <Input
                id="fullName"
                required
                placeholder="Votre nom complet"
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
              placeholder="Titre complet de votre article"
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
              placeholder="Séparez les mots-clés par des virgules (ex: médecine, recherche, santé)"
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
              <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Fichier sélectionné: {file.name}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 p-4 bg-secondary/30 rounded-lg">
            <Checkbox
              id="certified"
              checked={formData.certified}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, certified: checked as boolean })
              }
            />
            <Label htmlFor="certified" className="text-sm font-normal cursor-pointer">
              Je certifie que cet article est original, n'a pas été publié ailleurs et n'est pas soumis à une autre revue *
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Soumission en cours...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Soumettre l'article
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

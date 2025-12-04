import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function JournalManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("volumes");
  const [editingItem, setEditingItem] = useState<any>(null);

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
        .select(`
          *,
          journal_volumes (
            volume_number
          )
        `)
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
        .select(`
          *,
          journal_issues (
            issue_number,
            journal_volumes (
              volume_number
            )
          )
        `)
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

  const handleDelete = async (table: string, id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;

    try {
      const { error } = await supabase.from(table as any).delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Supprimé",
        description: "L'élément a été supprimé avec succès",
      });

      await queryClient.invalidateQueries();
    } catch (error: any) {
      console.error("Error deleting:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestion de la Revue Scientifique</h2>
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
          <VolumeManagement volumes={volumes} isLoading={volumesLoading} onDelete={handleDelete} />
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <IssueManagement issues={issues} volumes={volumes} isLoading={issuesLoading} onDelete={handleDelete} />
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <ArticleManagement articles={articles} issues={issues} isLoading={articlesLoading} onDelete={handleDelete} />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <SubmissionManagement submissions={submissions} isLoading={submissionsLoading} />
        </TabsContent>

        <TabsContent value="committee" className="space-y-4">
          <CommitteeManagement committee={committee} isLoading={committeeLoading} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Placeholder components (these would need full implementation)
function VolumeManagement({ volumes, isLoading, onDelete }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Volumes</CardTitle>
        <CardDescription>Gérer les volumes de la revue</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <p className="text-muted-foreground">
            {volumes?.length || 0} volume(s) • Interface de gestion complète à venir
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function IssueManagement({ issues, volumes, isLoading, onDelete }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Numéros</CardTitle>
        <CardDescription>Gérer les numéros de chaque volume</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <p className="text-muted-foreground">
            {issues?.length || 0} numéro(s) • Interface de gestion complète à venir
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ArticleManagement({ articles, issues, isLoading, onDelete }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Articles</CardTitle>
        <CardDescription>Gérer les articles publiés</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <p className="text-muted-foreground">
            {articles?.length || 0} article(s) • Interface de gestion complète à venir
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SubmissionManagement({ submissions, isLoading }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Soumissions d'Articles</CardTitle>
        <CardDescription>Gérer les manuscrits soumis</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <p className="text-muted-foreground">
            {submissions?.length || 0} soumission(s) • Interface de gestion complète à venir
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CommitteeManagement({ committee, isLoading, onDelete }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comité Éditorial</CardTitle>
        <CardDescription>Gérer les membres du comité éditorial</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <p className="text-muted-foreground">
            {committee?.length || 0} membre(s) • Interface de gestion complète à venir
          </p>
        )}
      </CardContent>
    </Card>
  );
}

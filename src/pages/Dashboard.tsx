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
import { Loader2, Plus, Edit, Trash2, FileText, Users, Calendar, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OrganizationManagement } from "@/components/OrganizationManagement";
import { DepartmentMembersManagement } from "@/components/DepartmentMembersManagement";
import { LibraryManagement } from "@/components/LibraryManagement";
import { PublicationManagement } from "@/components/PublicationManagement";
import { EventsManagement } from "@/components/EventsManagement";
import { JournalManagement } from "@/components/JournalManagement";
import { ArticleSubmissionForm } from "@/components/ArticleSubmissionForm";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useUserRole();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

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
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="publications">
              <FileText className="h-4 w-4 mr-2" />
              Publications
            </TabsTrigger>
            <TabsTrigger value="submit-article">
              <BookOpen className="h-4 w-4 mr-2" />
              Soumettre Article
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
                <TabsTrigger value="events">
                  <Calendar className="h-4 w-4 mr-2" />
                  Événements
                </TabsTrigger>
                <TabsTrigger value="journal">
                  <BookOpen className="h-4 w-4 mr-2" />
                  CSEM Journal
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="publications" className="space-y-6">
            <PublicationManagement />
          </TabsContent>

          <TabsContent value="submit-article" className="space-y-6">
            <ArticleSubmissionForm userId={user?.id || ""} userEmail={user?.email || ""} />
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
              
              <TabsContent value="events">
                <EventsManagement />
              </TabsContent>

              <TabsContent value="journal">
                <JournalManagement />
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

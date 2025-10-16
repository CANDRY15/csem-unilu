import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Linkedin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const Team = () => {
  const { data: leadership, isLoading: loadingLeadership } = useQuery({
    queryKey: ["comite-central"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comite_central")
        .select("*")
        .order("ordre", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: departments, isLoading: loadingDepartments } = useQuery({
    queryKey: ["departements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departements")
        .select("*")
        .order("ordre", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Notre Équipe
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rencontrez les membres dévoués qui font vivre le CSEM
          </p>
        </div>

        {/* Leadership Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Comité Central 2025-2026</h2>
          {loadingLeadership ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center space-y-4">
                    <Skeleton className="h-24 w-24 mx-auto rounded-full" />
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {leadership?.map((member) => (
                <Card
                  key={member.id}
                  className="hover:shadow-brand transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-6 text-center space-y-4">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.nom}
                        className="h-24 w-24 mx-auto rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground">
                        {member.nom.split(" ")[0]?.[0]}
                        {member.nom.split(" ")[member.nom.split(" ").length - 1]?.[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">{member.nom}</h3>
                      <p className="text-primary font-medium">{member.fonction}</p>
                      <p className="text-sm text-muted-foreground mt-1">{member.niveau}</p>
                    </div>
                    {member.description && (
                      <p className="text-sm text-muted-foreground">{member.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Departments Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Départements</h2>
          {loadingDepartments ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-full mb-4" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {departments?.map((dept) => (
                <Card key={dept.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-3">{dept.nom}</h3>
                        
                        {dept.directeur_nom && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-muted-foreground">Directeur</p>
                            <p className="text-base">
                              {dept.directeur_nom}
                              {dept.directeur_niveau && (
                                <span className="text-sm text-primary ml-2">({dept.directeur_niveau})</span>
                              )}
                            </p>
                          </div>
                        )}
                        
                        {dept.vice_nom && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Vice-directeur</p>
                            <p className="text-base">
                              {dept.vice_nom}
                              {dept.vice_niveau && (
                                <span className="text-sm text-primary ml-2">({dept.vice_niveau})</span>
                              )}
                            </p>
                          </div>
                        )}
                        
                        {dept.description && (
                          <p className="text-sm text-muted-foreground mt-3">{dept.description}</p>
                        )}
                      </div>
                      
                      {dept.membres_count > 0 && (
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-2 text-primary">
                            <Users className="h-5 w-5" />
                            <span className="text-2xl font-bold">{dept.membres_count}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">membres</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Join CTA */}
        <Card className="mt-16 bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold">Rejoignez Notre Équipe</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Le CSEM est toujours à la recherche d'étudiants motivés et passionnés par la recherche
              scientifique. Faites partie de notre famille!
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Team;

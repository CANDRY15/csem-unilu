import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Facebook, Twitter, Instagram, Mail } from "lucide-react";

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: department, isLoading: loadingDepartment } = useQuery({
    queryKey: ["department", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departements")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ["department-members", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membres_departement")
        .select("*")
        .eq("departement_id", id)
        .order("ordre");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-20">
        {/* Header */}
        <section className="bg-gradient-brand py-12">
          <div className="container mx-auto px-4">
            <Link to="/team">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'équipe
              </Button>
            </Link>
            
            {loadingDepartment ? (
              <Skeleton className="h-12 w-64 mx-auto" />
            ) : (
              <div className="text-center">
                {department?.logo && (
                  <div className="mb-4">
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/department-logos/${department.logo}`}
                      alt={department.nom}
                      className="h-24 w-24 object-contain mx-auto"
                    />
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {department?.nom}
                </h1>
                {department?.description && (
                  <p className="text-lg text-white/90 max-w-2xl mx-auto">
                    {department.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Members Section */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            {loadingMembers ? (
              <div className="grid gap-8 max-w-6xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-8">
                    <div className="grid md:grid-cols-3 gap-8 items-center">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-64 w-64 rounded-full mx-auto" />
                      <Skeleton className="h-48 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : members?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Aucun membre dans ce département pour le moment.
                </p>
              </div>
            ) : (
              <div className="grid gap-12 max-w-6xl mx-auto">
                {members?.map((member) => (
                  <Card key={member.id} className="overflow-hidden shadow-brand hover:shadow-lg transition-all">
                    <div className="p-8 md:p-12">
                      <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold mb-2">{member.nom}</h3>
                        <p className="text-lg text-muted-foreground">{member.fonction}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-8 items-start">
                        {/* Sur moi */}
                        <div className="space-y-4">
                          <h4 className="text-xl font-semibold text-primary">Sur moi</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {member.bio || "Membre actif du département, contribuant avec passion aux objectifs de la CSEM."}
                          </p>
                        </div>

                        {/* Photo */}
                        <div className="flex justify-center">
                          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-primary/20 shadow-brand">
                            {member.photo ? (
                              <img
                                src={`https://ozegzzvoinvluvilztra.supabase.co/storage/v1/object/public/member-photos/${member.photo}`}
                                alt={member.nom}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-5xl font-bold">${member.nom.charAt(0)}</div>`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-5xl font-bold">
                                {member.nom.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Des détails */}
                        <div className="space-y-4">
                          <h4 className="text-xl font-semibold text-primary">Des détails</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-muted-foreground">Nom:</p>
                              <p className="text-foreground">{member.nom}</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-muted-foreground">Fonction:</p>
                              <p className="text-foreground">{member.fonction}</p>
                            </div>
                            {member.niveau && (
                              <div>
                                <p className="text-sm font-semibold text-muted-foreground">Niveau:</p>
                                <p className="text-foreground">{member.niveau}</p>
                              </div>
                            )}
                            {member.contact && (
                              <div>
                                <p className="text-sm font-semibold text-muted-foreground">Contact:</p>
                                <p className="text-foreground">{member.contact}</p>
                              </div>
                            )}
                            <div className="flex gap-3 pt-2">
                              <a href="#" className="text-foreground hover:text-primary transition-colors">
                                <Facebook className="w-5 h-5" />
                              </a>
                              <a href="#" className="text-foreground hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                              </a>
                              <a href="#" className="text-foreground hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                              </a>
                              {member.contact && (
                                <a href={`mailto:${member.contact}`} className="text-foreground hover:text-primary transition-colors">
                                  <Mail className="w-5 h-5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

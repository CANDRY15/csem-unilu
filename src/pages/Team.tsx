import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";

export default function Team() {
  const { data: leadership, isLoading: loadingLeadership } = useQuery({
    queryKey: ["leadership"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comite_central")
        .select("*")
        .order("ordre");
      if (error) throw error;
      return data;
    },
  });

  const { data: departments, isLoading: loadingDepartments } = useQuery({
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-brand py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Notre Équipe
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Découvrez les membres passionnés qui composent la CSEM
            </p>
          </div>
        </section>

        {/* Comité Central Section */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-brand bg-clip-text text-transparent">
              Comité Central
            </h2>
            
            {loadingLeadership ? (
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
            ) : (
              <div className="grid gap-12 max-w-6xl mx-auto">
                {leadership?.map((member) => (
                  <Link key={member.id} to={`/team/comite/${member.id}`}>
                    <Card className="overflow-hidden shadow-brand hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-primary/20">
                      <div className="p-8 md:p-12">
                      <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors">{member.nom}</h3>
                        <p className="text-lg text-muted-foreground">{member.fonction}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-8 items-start">
                        {/* Sur moi */}
                        <div className="space-y-4">
                          <h4 className="text-xl font-semibold text-primary">Sur moi</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {member.description || "Membre dévoué de la CSEM, contribuant activement à la mission de l'organisation."}
                          </p>
                        </div>

                        {/* Photo */}
                        <div className="flex justify-center">
                          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-primary/20 shadow-brand">
                            {member.photo ? (
                              <img
                                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-photos/${member.photo}`}
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
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Départements Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-brand bg-clip-text text-transparent">
              Nos Départements
            </h2>
            
            {loadingDepartments ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-16 w-16 mx-auto mb-4" />
                    <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-20 w-full" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {departments?.map((dept) => (
                  <Link key={dept.id} to={`/team/department/${dept.id}`}>
                    <Card className="overflow-hidden hover:shadow-brand transition-all h-full group cursor-pointer border-2 border-transparent hover:border-primary/20">
                      <div className="p-8">
                        <div className="flex flex-col items-center text-center space-y-6">
                          {/* Logo */}
                            {dept.logo && (
                            <div className="w-24 h-24 flex items-center justify-center">
                              <img
                                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/department-logos/${dept.logo}`}
                                alt={dept.nom}
                                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Nom du département */}
                          <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                            {dept.nom}
                          </h3>
                          
                          {/* Description/Coordonnées */}
                          {dept.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {dept.description}
                            </p>
                          )}
                          
                          {/* Nombre de membres */}
                          {dept.membres_count > 0 && (
                            <p className="text-sm font-semibold text-primary">
                              {dept.membres_count} membre{dept.membres_count > 1 ? 's' : ''}
                            </p>
                          )}
                          
                          {/* Bouton */}
                          <Button 
                            variant="outline" 
                            className="mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors w-full"
                          >
                            Voir les membres
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
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

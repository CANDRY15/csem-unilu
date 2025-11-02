import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";

export default function ComiteMemberDetail() {
  const { id } = useParams();

  const { data: member, isLoading } = useQuery({
    queryKey: ["comite-member", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comite_central")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-20">
        {/* Header Section */}
        <section className="bg-gradient-brand py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="text-center">
                <Skeleton className="h-12 w-96 mx-auto mb-4" />
                <Skeleton className="h-6 w-64 mx-auto" />
              </div>
            ) : (
              <div className="text-center text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {member?.nom.toUpperCase()}
                </h1>
                <p className="text-xl text-white/90">
                  {member?.fonction}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Member Details */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4 max-w-6xl">
            {isLoading ? (
              <Card className="p-8">
                <div className="grid md:grid-cols-3 gap-8 items-start">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-80 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </Card>
            ) : member ? (
              <Card className="overflow-hidden shadow-brand">
                <div className="p-8 md:p-12">
                  <div className="grid md:grid-cols-3 gap-8 items-start">
                    {/* Sur moi */}
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-primary">Sur moi</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {member.description || "Membre dévoué de la CSEM, contribuant activement à la mission de l'organisation."}
                      </p>
                    </div>

                    {/* Photo */}
                    <div className="flex justify-center">
                      <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-primary/20 shadow-brand">
                        {member.photo ? (
                          <img
                            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/member-photos/${member.photo}`}
                            alt={member.nom}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-6xl font-bold">${member.nom.charAt(0)}</div>`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-6xl font-bold">
                            {member.nom.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Des détails */}
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-primary">Des détails</h2>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Nom:</p>
                          <p className="text-lg font-medium text-foreground">{member.nom}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">Fonction:</p>
                          <p className="text-lg font-medium text-foreground">{member.fonction}</p>
                        </div>
                        {member.niveau && (
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground">Niveau:</p>
                            <p className="text-lg font-medium text-foreground">{member.niveau}</p>
                          </div>
                        )}
                        {member.contact && (
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground">Contact:</p>
                            <p className="text-lg font-medium text-foreground">{member.contact}</p>
                          </div>
                        )}
                        <div className="flex gap-4 pt-4">
                          <a href="#" className="text-foreground hover:text-primary transition-colors">
                            <Facebook className="w-6 h-6" />
                          </a>
                          <a href="#" className="text-foreground hover:text-primary transition-colors">
                            <Twitter className="w-6 h-6" />
                          </a>
                          <a href="#" className="text-foreground hover:text-primary transition-colors">
                            <Instagram className="w-6 h-6" />
                          </a>
                          {member.contact && (
                            <a href={`mailto:${member.contact}`} className="text-foreground hover:text-primary transition-colors">
                              <Mail className="w-6 h-6" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Membre non trouvé</p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

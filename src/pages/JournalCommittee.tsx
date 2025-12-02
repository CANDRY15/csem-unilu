import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function JournalCommittee() {
  const { data: members, isLoading } = useQuery({
    queryKey: ["editorial-committee"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("editorial_committee")
        .select("*")
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <SEO
        title="Comité Éditorial | CSEM Journal"
        description="Découvrez l'équipe éditoriale du CSEM Journal - Revue Scientifique de la CSEM"
      />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
        <Navigation />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <Link to="/journal">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la revue
            </Button>
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Comité Éditorial
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Le comité éditorial du CSEM Journal garantit la qualité scientifique et l'excellence académique de nos publications.
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Mission de la Revue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Le CSEM Journal a pour mission de promouvoir la recherche scientifique et médicale au sein de la communauté estudiantine et académique. Nous nous engageons à publier des travaux de haute qualité qui contribuent à l'avancement des connaissances médicales.
              </p>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Objectifs</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Encourager la recherche scientifique chez les étudiants en médecine</li>
                  <li>Diffuser les connaissances médicales et scientifiques</li>
                  <li>Maintenir des standards élevés de qualité éditoriale</li>
                  <li>Favoriser l'innovation et l'excellence académique</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Processus Éditorial</h3>
                <p>
                  Tous les manuscrits soumis font l'objet d'une révision par les pairs rigoureuse. Le comité éditorial évalue chaque soumission selon des critères de qualité scientifique, d'originalité, de méthodologie et de pertinence pour notre lectorat.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Committee Members */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Membres du Comité</h2>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-24 w-24 bg-muted rounded-full mx-auto mb-4"></div>
                      <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : members && members.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((member) => (
                  <Card key={member.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src={member.photo_url || undefined} alt={member.name} />
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                          {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl">{member.name}</CardTitle>
                      <CardDescription className="text-base font-medium text-primary">
                        {member.role}
                      </CardDescription>
                      {member.affiliation && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {member.affiliation}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {member.bio && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {member.bio}
                        </p>
                      )}
                      {member.email && (
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href={`mailto:${member.email}`}>
                            <Mail className="mr-2 h-4 w-4" />
                            Contacter
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Le comité éditorial sera bientôt présenté.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

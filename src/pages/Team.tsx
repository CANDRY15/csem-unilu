import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Linkedin } from "lucide-react";

const Team = () => {
  const leadership = [
    {
      name: "Dr. Jean Kabamba",
      role: "Président CSEM",
      specialty: "Chirurgie Générale",
    },
    {
      name: "Marie Tshilombo",
      role: "Vice-Présidente",
      specialty: "Médecine Interne",
    },
    {
      name: "David Mukendi",
      role: "Secrétaire Général",
      specialty: "Pédiatrie",
    },
    {
      name: "Sarah Mbuyi",
      role: "Trésorière",
      specialty: "Gynécologie",
    },
  ];

  const departments = [
    {
      name: "Département Recherche",
      head: "Dr. Paul Kasongo",
      members: 15,
    },
    {
      name: "Département Publications",
      head: "Marie Kalala",
      members: 12,
    },
    {
      name: "Département Événements",
      head: "Joseph Mwamba",
      members: 20,
    },
    {
      name: "Département Communication",
      head: "Grace Ngoy",
      members: 10,
    },
  ];

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
          <h2 className="text-3xl font-bold mb-8 text-center">Bureau Exécutif</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((member, index) => (
              <Card
                key={index}
                className="hover:shadow-brand transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground">
                    {member.name.split(" ")[0][0]}
                    {member.name.split(" ")[1][0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                    <p className="text-sm text-muted-foreground mt-1">{member.specialty}</p>
                  </div>
                  <div className="flex gap-2 justify-center pt-2">
                    <button className="p-2 rounded-lg hover:bg-primary/10 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-secondary/10 transition-colors">
                      <Linkedin className="h-5 w-5 text-secondary" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Departments Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Départements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {departments.map((dept, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{dept.name}</h3>
                      <p className="text-muted-foreground">Chef: {dept.head}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {dept.members}
                      </div>
                      <p className="text-sm text-muted-foreground">membres</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";

export default function JournalInstructions() {
  return (
    <>
      <SEO
        title="Instructions aux Auteurs | CSEM Journal"
        description="Consignes et directives pour la soumission d'articles au CSEM Journal"
      />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
        <Navigation />
        
        <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/journal">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la revue
            </Button>
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Instructions aux Auteurs
            </h1>
            <p className="text-lg text-muted-foreground">
              Directives pour la préparation et la soumission de manuscrits
            </p>
          </div>

          <div className="space-y-6">
            {/* Types d'articles */}
            <Card>
              <CardHeader>
                <CardTitle>Types d'Articles Acceptés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li>Articles de recherche originaux</li>
                  <li>Revues systématiques et méta-analyses</li>
                  <li>Cas cliniques</li>
                  <li>Articles de synthèse</li>
                  <li>Communications brèves</li>
                  <li>Lettres à l'éditeur</li>
                </ul>
              </CardContent>
            </Card>

            {/* Format du manuscrit */}
            <Card>
              <CardHeader>
                <CardTitle>Format du Manuscrit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Structure Générale</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Page de titre (titre, auteurs, affiliations, correspondance)</li>
                    <li>Résumé structuré (150-300 mots)</li>
                    <li>Mots-clés (3-6 mots)</li>
                    <li>Introduction</li>
                    <li>Matériels et Méthodes</li>
                    <li>Résultats</li>
                    <li>Discussion</li>
                    <li>Conclusion</li>
                    <li>Références bibliographiques</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Mise en Page</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Police: Times New Roman, taille 12</li>
                    <li>Interligne: double</li>
                    <li>Marges: 2,5 cm de chaque côté</li>
                    <li>Numérotation des pages</li>
                    <li>Format: PDF ou DOCX</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Style de citation */}
            <Card>
              <CardHeader>
                <CardTitle>Style de Citation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Le CSEM Journal utilise le style Vancouver pour les références bibliographiques.
                </p>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Exemples:</h3>
                  <div className="bg-secondary/50 p-4 rounded-lg space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground mb-1">Article de revue:</p>
                      <p className="italic">
                        Auteur(s). Titre de l'article. Titre de la Revue. Année;Volume(Numéro):Pages.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">Livre:</p>
                      <p className="italic">
                        Auteur(s). Titre du livre. Édition. Lieu de publication: Éditeur; Année.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Règles éthiques */}
            <Card>
              <CardHeader>
                <CardTitle>Règles Éthiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li>Les travaux doivent être originaux et non publiés ailleurs</li>
                  <li>Déclaration des conflits d'intérêts obligatoire</li>
                  <li>Approbation éthique requise pour les études impliquant des humains ou des animaux</li>
                  <li>Consentement éclairé des patients pour les cas cliniques</li>
                  <li>Respect du droit d'auteur et citation appropriée des sources</li>
                  <li>Tous les auteurs doivent avoir contribué de manière significative au travail</li>
                </ul>
              </CardContent>
            </Card>

            {/* Processus de révision */}
            <Card>
              <CardHeader>
                <CardTitle>Processus de Révision par les Pairs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Tous les manuscrits soumis font l'objet d'une révision par les pairs en double aveugle.
                </p>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Délais:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Accusé de réception: 48 heures</li>
                    <li>Première décision éditoriale: 4-6 semaines</li>
                    <li>Publication après acceptation: 2-4 semaines</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Soumission */}
            <Card>
              <CardHeader>
                <CardTitle>Procédure de Soumission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Les manuscrits doivent être soumis via notre plateforme en ligne. Assurez-vous d'avoir:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Un compte utilisateur actif</li>
                  <li>Votre manuscrit au format PDF ou DOCX</li>
                  <li>Les informations de tous les co-auteurs</li>
                  <li>Une déclaration de conflit d'intérêts</li>
                </ul>
                <Link to="/journal/soumettre">
                  <Button className="w-full">
                    Soumettre un Article
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Template */}
            <Card>
              <CardHeader>
                <CardTitle>Template de Manuscrit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Pour faciliter la préparation de votre manuscrit, nous recommandons d'utiliser notre template officiel.
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le Template (Bientôt disponible)
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

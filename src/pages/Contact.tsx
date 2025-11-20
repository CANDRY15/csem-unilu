import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Facebook, Twitter, Linkedin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const contactFormSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string()
    .trim()
    .email("Email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  subject: z.string()
    .trim()
    .min(1, "Le sujet est requis")
    .max(200, "Le sujet ne peut pas dépasser 200 caractères"),
  message: z.string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
});

const Contact = () => {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    try {
      // Sanitize and encode values for WhatsApp
      const encodedMessage = encodeURIComponent(
        `Nom: ${values.name}\nEmail: ${values.email}\nSujet: ${values.subject}\n\nMessage:\n${values.message}`
      );
      
      // Open WhatsApp with pre-filled message
      window.open(`https://wa.me/243815050397?text=${encodedMessage}`, '_blank');
      
      toast.success("Message préparé! Vous pouvez l'envoyer via WhatsApp.");
      form.reset();
    } catch (error) {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SEO
        title="Contact"
        description="Contactez le CSEM UNILU pour toute question ou collaboration. Adresse, réseaux sociaux et formulaire de contact disponibles."
        keywords="contact CSEM, contacter CSEM, adresse CSEM Lubumbashi, email CSEM, réseaux sociaux CSEM"
        url="https://csem-unilu.org/contact"
      />
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Contactez-Nous
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nous sommes là pour répondre à vos questions et suggestions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card>
            <CardContent className="p-8 space-y-6">
              <h2 className="text-2xl font-bold">Envoyez-nous un Message</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom Complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="votre@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sujet</FormLabel>
                        <FormControl>
                          <Input placeholder="Sujet de votre message" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Écrivez votre message ici..."
                            rows={6}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    variant="hero" 
                    className="w-full" 
                    size="lg" 
                    type="submit"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Envoi..." : "Envoyer le Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8 space-y-6">
                <h2 className="text-2xl font-bold">Informations de Contact</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Adresse</h3>
                      <p className="text-muted-foreground">
                        Faculté de Médecine
                        <br />
                        Université de Lubumbashi
                        <br />
                        Lubumbashi, RDC
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <div className="p-3 rounded-lg bg-secondary/10">
                      <Mail className="h-6 w-6 text-secondary" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <Phone className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardContent className="p-8 space-y-4">
                <h2 className="text-2xl font-bold">Suivez-nous</h2>
                <p className="text-muted-foreground">
                  Restez connectés avec le CSEM sur nos réseaux sociaux
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-muted hover:bg-secondary hover:text-secondary-foreground transition-colors"
                  >
                    <Twitter className="h-6 w-6" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Heures d'Ouverture</h2>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span className="font-medium">08:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="font-medium">09:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="font-medium">Fermé</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;

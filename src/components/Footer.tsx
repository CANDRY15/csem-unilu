import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              CSEM
            </h3>
            <p className="text-sm text-muted-foreground">
              La Cellule Scientifique des Etudiants en Médecine est un club scientifique au sein de la Faculté de Médecine de l'Université de Lubumbashi, créé depuis 2003 par ceux qui sont aujourd'hui nos éminents professeurs, CT et assistants. Ce club est l'unique de l'UNILU qui fait partie des CLEF (Clubs Leaders des Etudiants Francophones - AUF) depuis 5 bonnes années déjà.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Liens Rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/library" className="text-muted-foreground hover:text-primary transition-colors">
                  Bibliothèque
                </Link>
              </li>
              <li>
                <Link to="/publications" className="text-muted-foreground hover:text-primary transition-colors">
                  Publications
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-muted-foreground hover:text-primary transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-muted-foreground hover:text-primary transition-colors">
                  Notre Équipe
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Université de Lubumbashi, RDC</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@csem-unilu.org</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+243 XXX XXX XXX</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold">Suivez-nous</h3>
            <div className="flex gap-3">
              <a
                href="https://x.com/CsemUnilu54331?t=mOlpUubiVgNSQlgjruOo7w&s=08"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/csemunilu101?igsh=c3pyaGd1YXNmeDJt"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-secondary hover:text-secondary-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbARYq08vd1O4a8cZz3v"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CSEM - Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
};

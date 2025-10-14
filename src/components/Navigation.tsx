import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, LayoutDashboard, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import csemLogo from "@/assets/csem-logo.jpg";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { canPublish } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const navItems = [
    { name: "Accueil", path: "/" },
    { name: "Bibliothèque", path: "/library" },
    { name: "Publications", path: "/publications" },
    { name: "Événements", path: "/events" },
    { name: "Équipe", path: "/team" },
    { name: "Contact", path: "/contact" },
    { name: "Soumettre un article", path: "/article-review" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src={csemLogo} alt="CSEM Logo" className="h-12 w-12 object-contain rounded-full" />
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                CSEM
              </span>
              <span className="text-xs text-muted-foreground">Faculté de Médecine</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  {item.name}
                </Button>
              </Link>
            ))}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-4">
                    <User className="h-5 w-5 mr-2" />
                    Mon Compte
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {canPublish && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Tableau de bord
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/my-submissions")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Mes soumissions
                      </DropdownMenuItem>
                    </>
                  )}
                  {!canPublish && (
                    <DropdownMenuItem onClick={() => navigate("/my-submissions")}>
                      <FileText className="mr-2 h-4 w-4" />
                      Mes soumissions
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="hero" className="ml-4">
                  Connexion
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-foreground">
                  {item.name}
                </Button>
              </Link>
            ))}
            {user ? (
              <>
                {canPublish && (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Tableau de bord
                    </Button>
                  </Link>
                )}
                <Button variant="hero" className="w-full mt-2" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button variant="hero" className="w-full mt-2">
                  Connexion
                </Button>
              </Link>
            )}
          </div>
          </div>
        )}
      </div>
    </nav>
  );
};

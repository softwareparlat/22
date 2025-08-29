import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Code, Menu, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  onAuthClick: (mode: "login" | "register") => void;
}

export default function Layout({ children, onAuthClick }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    // Si no estamos en la página principal, redirigir primero
    if (window.location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-sans"> {/* Apply Poppins font */}
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 backdrop-blur-md border-b z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 border-border shadow-lg' 
          : 'bg-card/80 border-border/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className={`text-xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}>SoftwarePar</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/"
                className={`transition-all duration-300 hover:scale-105 font-semibold ${
                  window.location.pathname !== '/' || isScrolled
                    ? 'text-foreground hover:text-primary' 
                    : 'header-nav-text'
                }`}
                data-testid="nav-inicio"
              >
                Inicio
              </a>
              <button
                onClick={() => scrollToSection('servicios')}
                className={`transition-all duration-300 hover:scale-105 font-semibold ${
                  window.location.pathname !== '/' || isScrolled
                    ? 'text-foreground hover:text-primary' 
                    : 'header-nav-text'
                }`}
                data-testid="nav-servicios"
              >
                Servicios
              </button>
              <button
                onClick={() => scrollToSection('precios')}
                className={`transition-all duration-300 hover:scale-105 font-semibold ${
                  window.location.pathname !== '/' || isScrolled
                    ? 'text-foreground hover:text-primary' 
                    : 'header-nav-text'
                }`}
                data-testid="nav-precios"
              >
                Precios
              </button>
              <button
                onClick={() => scrollToSection('contacto')}
                className={`transition-all duration-300 hover:scale-105 font-medium ${
                  window.location.pathname !== '/' || isScrolled
                    ? 'text-foreground hover:text-primary' 
                    : 'header-nav-text'
                }`}
                data-testid="nav-contacto"
              >
                Contacto
              </button>

              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => onAuthClick('login')}
                  className={`transition-all duration-300 font-semibold ${
                    window.location.pathname !== '/' || isScrolled 
                      ? 'text-foreground hover:bg-muted hover:text-primary' 
                      : 'header-button-text hover:bg-white/20'
                  }`}
                  data-testid="button-login"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  onClick={() => onAuthClick('register')}
                  className={`font-semibold shadow-lg transition-all duration-300 hover:scale-105 ${
                    window.location.pathname !== '/' || isScrolled
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-white text-primary hover:bg-white/95'
                  }`}
                  data-testid="button-register"
                >
                  Registrarse
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden transition-colors duration-300 ${
                isScrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/20'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t transition-colors duration-300 ${
            isScrolled 
              ? 'bg-white/95 border-border' 
              : 'bg-card/95 border-border/50'
          }`}>
            <div className="px-4 py-3 space-y-3">
              <a
                href="/"
                className={`block w-full text-left hover:text-primary py-2 font-medium transition-colors duration-300 ${
                  window.location.pathname !== '/' || isScrolled ? 'text-foreground' : 'text-white'
                }`}
                data-testid="mobile-nav-inicio"
              >
                Inicio
              </a>
              <button
                onClick={() => scrollToSection('servicios')}
                className={`block w-full text-left hover:text-primary py-2 font-medium transition-colors duration-300 ${
                  window.location.pathname !== '/' || isScrolled ? 'text-muted-foreground' : 'text-white/80'
                }`}
                data-testid="mobile-nav-servicios"
              >
                Servicios
              </button>
              <button
                onClick={() => scrollToSection('precios')}
                className={`block w-full text-left hover:text-primary py-2 font-medium transition-colors duration-300 ${
                  window.location.pathname !== '/' || isScrolled ? 'text-muted-foreground' : 'text-white/80'
                }`}
                data-testid="mobile-nav-precios"
              >
                Precios
              </button>
              <button
                onClick={() => scrollToSection('contacto')}
                className={`block w-full text-left hover:text-primary py-2 font-medium transition-colors duration-300 ${
                  window.location.pathname !== '/' || isScrolled ? 'text-muted-foreground' : 'text-white/80'
                }`}
                data-testid="mobile-nav-contacto"
              >
                Contacto
              </button>
              <div className={`pt-3 border-t space-y-2 transition-colors duration-300 ${
                isScrolled ? 'border-border' : 'border-white/20'
              }`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start transition-colors duration-300 ${
                    window.location.pathname !== '/' || isScrolled
                      ? 'text-foreground hover:bg-muted' 
                      : 'text-white hover:bg-white/20'
                  }`}
                  onClick={() => onAuthClick('login')}
                  data-testid="mobile-button-login"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  className={`w-full transition-colors duration-300 ${
                    window.location.pathname !== '/' || isScrolled
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-white text-primary hover:bg-white/95'
                  }`}
                  onClick={() => onAuthClick('register')}
                  data-testid="mobile-button-register"
                >
                  Registrarse
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {children}
    </div>
  );
}
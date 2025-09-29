import { Button } from "@/components/ui/button";
import { Brain, Menu } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow group-hover:shadow-elevated transition-all">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Synapse
            </span>
          </a>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Recursos
            </a>
            <a href="#como-funciona" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Como Funciona
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Preços
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Sobre
            </a>
          </div>
          
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
            <Button variant="gradient" size="sm">
              Começar Grátis
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <a href="#features" className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Recursos
            </a>
            <a href="#como-funciona" className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Como Funciona
            </a>
            <a href="#" className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Preços
            </a>
            <a href="#" className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Sobre
            </a>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="ghost" size="sm" className="w-full">
                Entrar
              </Button>
              <Button variant="gradient" size="sm" className="w-full">
                Começar Grátis
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

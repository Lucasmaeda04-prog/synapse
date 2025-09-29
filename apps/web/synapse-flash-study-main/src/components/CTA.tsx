import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-primary/30 shadow-card">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Comece Hoje Gratuitamente</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Pronto para Revolucionar o
            <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
              Aprendizado?
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Junte-se a centenas de educadores que já estão usando o Synapse para maximizar 
            a retenção de conhecimento e o engajamento dos alunos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" variant="gradient" className="group">
              Criar Conta Gratuita
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="hero">
              Agendar Demo
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Sem cartão de crédito • Configuração em 2 minutos • Suporte em português
          </p>
        </div>
      </div>
    </section>
  );
};

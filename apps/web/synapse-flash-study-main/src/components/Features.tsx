import { Card } from "@/components/ui/card";
import { Brain, BarChart3, Users, Sparkles, Clock, Target } from "lucide-react";
import featureCards from "@/assets/feature-cards.jpg";
import featureAnalytics from "@/assets/feature-analytics.jpg";

const features = [
  {
    icon: Brain,
    title: "Repetição Espaçada Inteligente",
    description: "Algoritmo científico que otimiza o intervalo de revisão baseado no desempenho individual de cada aluno.",
  },
  {
    icon: BarChart3,
    title: "Análise de Desempenho",
    description: "Acompanhe o progresso dos alunos em tempo real com dashboards detalhados e insights acionáveis.",
  },
  {
    icon: Users,
    title: "Gestão de Turmas",
    description: "Organize seus alunos em turmas, atribua decks específicos e monitore o engajamento coletivo.",
  },
  {
    icon: Sparkles,
    title: "Criação Simplificada",
    description: "Interface intuitiva para criar e editar flashcards com suporte a imagens, formatação e tags.",
  },
  {
    icon: Clock,
    title: "Estudo Flexível",
    description: "Acesse de qualquer dispositivo, a qualquer hora. O progresso é sincronizado automaticamente.",
  },
  {
    icon: Target,
    title: "Metas Personalizadas",
    description: "Defina objetivos de estudo e acompanhe conquistas. Mantenha a motivação em alta.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">
            Recursos que Potencializam o
            <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
              Aprendizado
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tudo que você precisa para criar uma experiência de ensino memorável e eficaz
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 space-y-4 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
        
        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 gap-8 mt-20">
          <div className="space-y-6 flex flex-col justify-center animate-fade-in">
            <h3 className="text-3xl font-bold">Flashcards Interativos</h3>
            <p className="text-lg text-muted-foreground">
              Crie decks personalizados com mídia rica, organize por dificuldade e acompanhe cada flip do card. 
              A interface intuitiva torna a criação de conteúdo rápida e prazerosa.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                </div>
                <span className="text-muted-foreground">Suporte a imagens e formatação rica</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                </div>
                <span className="text-muted-foreground">Categorização por tags e dificuldade</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                </div>
                <span className="text-muted-foreground">Importação e exportação de decks</span>
              </li>
            </ul>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-elevated animate-fade-in">
            <img 
              src={featureCards} 
              alt="Flashcards interativos do Synapse" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-elevated animate-fade-in md:order-first">
            <img 
              src={featureAnalytics} 
              alt="Dashboard de analytics do Synapse" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-6 flex flex-col justify-center animate-fade-in">
            <h3 className="text-3xl font-bold">Insights Poderosos</h3>
            <p className="text-lg text-muted-foreground">
              Dashboards completos mostram o desempenho individual e coletivo. Identifique padrões, 
              ajuste estratégias e celebre conquistas com dados em tempo real.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                </div>
                <span className="text-muted-foreground">Relatórios de retenção e progresso</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                </div>
                <span className="text-muted-foreground">Identificação de dificuldades comuns</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                </div>
                <span className="text-muted-foreground">Exportação de dados para análise</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

import { Card } from "@/components/ui/card";
import { FileText, Send, BarChart, Repeat } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Crie seus Decks",
    description: "Professores criam flashcards personalizados com perguntas e respostas otimizadas para o conteúdo da disciplina.",
    number: "01",
  },
  {
    icon: Send,
    title: "Distribua para Turmas",
    description: "Atribua decks específicos para suas turmas ou grupos de alunos com apenas alguns cliques.",
    number: "02",
  },
  {
    icon: Repeat,
    title: "Alunos Estudam",
    description: "Os alunos estudam seguindo o algoritmo de repetição espaçada, que adapta o intervalo baseado no desempenho.",
    number: "03",
  },
  {
    icon: BarChart,
    title: "Acompanhe Resultados",
    description: "Monitore o progresso em tempo real através de dashboards detalhados e ajuste sua estratégia de ensino.",
    number: "04",
  },
];

export const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">
            Como Funciona o
            <span className="block mt-2 bg-gradient-primary bg-clip-text text-transparent">
              Synapse
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Um processo simples e eficiente para transformar o aprendizado
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <Card className="relative p-6 space-y-4 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50">
                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-glow">
                  {step.number}
                </div>
                
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold text-card-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

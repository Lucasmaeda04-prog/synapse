import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, YAxis } from 'recharts';
import { listClassesByUser, listDecksByUser } from '@/lib/mockService';

export default function Reports() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user) return null;

  const isTeacher = user.role === 'TEACHER' || user.role === 'ADMIN';

  // KPIs
  const { kpis, chartData, chartConfig, chartTitle, chartDesc } = useMemo(() => {
    if (isTeacher) {
      const myDecks = listDecksByUser(user.id, 'teacher');
      const myClasses = listClassesByUser(user.id, 'teacher');
      const uniqueStudents = new Set<string>();
      myClasses.forEach((c) => c.studentIds.forEach((s) => uniqueStudents.add(s)));
      const totalCards = myDecks.reduce((acc, d) => acc + d.cards.length, 0);
      const totalAssignments = myClasses.reduce((acc, c) => acc + c.assignedDecks.length, 0);

      const data = myDecks.map((d) => ({ name: d.title, cards: d.cards.length }));

      return {
        kpis: [
          { label: 'Decks', value: myDecks.length },
          { label: 'Turmas', value: myClasses.length },
          { label: 'Alunos', value: uniqueStudents.size },
          { label: 'Cards', value: totalCards },
          { label: 'Atribuições', value: totalAssignments },
        ],
        chartData: data,
        chartConfig: {
          cards: { label: 'Cards', color: 'hsl(262.1 83.3% 57.8%)' },
        },
        chartTitle: 'Cards por Deck',
        chartDesc: 'Distribuição de flashcards por deck',
      } as const;
    } else {
      const myDecks = listDecksByUser(user.id, 'student');
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const dueToday = myDecks.reduce(
        (acc, d) => acc + d.cards.filter((c) => c.nextReview <= endOfToday).length,
        0,
      );
      const learned = myDecks.reduce(
        (acc, d) => acc + d.cards.filter((c) => c.repetitions > 0 || c.interval > 1).length,
        0,
      );
      const totalCards = myDecks.reduce((acc, d) => acc + d.cards.length, 0);
      const data = myDecks.map((d) => ({ name: d.title, due: d.cards.filter((c) => c.nextReview <= endOfToday).length }));

      return {
        kpis: [
          { label: 'Meus Decks', value: myDecks.length },
          { label: 'Cards', value: totalCards },
          { label: 'Due hoje', value: dueToday },
          { label: 'Aprendidos', value: learned },
        ],
        chartData: data,
        chartConfig: {
          due: { label: 'Due hoje', color: 'hsl(142.1 76.2% 36.3%)' },
        },
        chartTitle: 'Due hoje por Deck',
        chartDesc: 'Quantidade de cards vencidos por deck',
      } as const;
    }
  }, [isTeacher, user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Relatórios</h1>
        <p className="text-muted-foreground">Visão geral de desempenho</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{k.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{chartTitle}</CardTitle>
          <CardDescription>{chartDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full">
            <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} width={30} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {isTeacher ? (
                <Bar dataKey="cards" fill="var(--color-cards)" radius={4} activeBar={<Rectangle fill="var(--color-cards)" stroke="var(--color-cards)" />} />
              ) : (
                <Bar dataKey="due" fill="var(--color-due)" radius={4} activeBar={<Rectangle fill="var(--color-due)" stroke="var(--color-due)" />} />
              )}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}


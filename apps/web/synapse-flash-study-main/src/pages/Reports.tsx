import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, YAxis } from 'recharts';
import { useStudentOverview, useTeacherOverview, useClassReport, useDeckPerformance } from '@/hooks/api/useReports';
import { useClasses } from '@/hooks/api/useClasses';
import { useDecks } from '@/hooks/api/useDecks';
import { Loader2, Users, BookOpen, TrendingUp, Clock, Target } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function Reports() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user) return null;

  const isTeacher = user.role === 'TEACHER' || user.role === 'ADMIN';

  return isTeacher ? <TeacherReports /> : <StudentReports />;
}

function StudentReports() {
  const { data: overview, isLoading, error } = useStudentOverview();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Erro ao carregar relatórios: {error.message}
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  const kpis = [
    { label: 'Meus Decks', value: overview.total_decks, icon: BookOpen },
    { label: 'Cards', value: overview.total_cards, icon: Target },
    { label: 'Due hoje', value: overview.total_due_today, icon: Clock },
    { label: 'Aprendidos', value: overview.total_learned, icon: TrendingUp },
    { label: 'Precisão', value: `${Math.round(overview.overall_accuracy)}%`, icon: Target },
  ];

  const chartData = overview.decks.map((d) => ({
    name: d.deck_title.length > 15 ? d.deck_title.substring(0, 15) + '...' : d.deck_title,
    due: d.due_today,
    learned: d.learned,
  }));

  const chartConfig = {
    due: { label: 'Due hoje', color: 'hsl(0 84.2% 60.2%)' },
    learned: { label: 'Aprendidos', color: 'hsl(142.1 76.2% 36.3%)' },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Relatórios</h1>
        <p className="text-muted-foreground">Seu progresso de estudo</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-card">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">{k.label}</CardTitle>
              <k.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Progresso por Deck</CardTitle>
            <CardDescription>Cards devidos e aprendidos por deck</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-[300px]">
              <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} width={30} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="due" fill="var(--color-due)" radius={4} activeBar={<Rectangle fill="var(--color-due)" stroke="var(--color-due)" />} />
                <Bar dataKey="learned" fill="var(--color-learned)" radius={4} activeBar={<Rectangle fill="var(--color-learned)" stroke="var(--color-learned)" />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {overview.decks.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Detalhes por Deck</CardTitle>
            <CardDescription>Estatísticas detalhadas de cada deck</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Deck</th>
                    <th className="text-center py-2 font-medium">Cards</th>
                    <th className="text-center py-2 font-medium">Aprendidos</th>
                    <th className="text-center py-2 font-medium">Due</th>
                    <th className="text-center py-2 font-medium">Precisão</th>
                    <th className="text-center py-2 font-medium">Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.decks.map((deck) => (
                    <tr key={deck.deck_id} className="border-b last:border-0">
                      <td className="py-2">{deck.deck_title}</td>
                      <td className="text-center py-2">{deck.total_cards}</td>
                      <td className="text-center py-2">{deck.learned}</td>
                      <td className="text-center py-2">{deck.due_today}</td>
                      <td className="text-center py-2">{Math.round(deck.accuracy)}%</td>
                      <td className="text-center py-2">{deck.time_spent_minutes} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TeacherReports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');

  const { data: overview, isLoading: overviewLoading } = useTeacherOverview();
  const { data: classesData, isLoading: classesLoading } = useClasses({ limit: 100 });
  const { data: decksData, isLoading: decksLoading } = useDecks({ limit: 100 });
  const { data: classReport, isLoading: classReportLoading } = useClassReport(selectedClassId, !!selectedClassId);
  const { data: deckPerformance, isLoading: deckPerformanceLoading } = useDeckPerformance(selectedDeckId, !!selectedDeckId);

  const classes = classesData?.data || [];
  const decks = decksData?.data || [];

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Relatórios</h1>
        <p className="text-muted-foreground">Visão geral de desempenho</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="class">Por Turma</TabsTrigger>
          <TabsTrigger value="deck">Por Deck</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {overview && <OverviewContent overview={overview} />}
        </TabsContent>

        <TabsContent value="class" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecione uma Turma</CardTitle>
              <CardDescription>Visualize o progresso dos alunos de uma turma específica</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder={classesLoading ? "Carregando..." : "Selecione uma turma"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name} ({c.students_count} alunos)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedClassId && (
            classReportLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : classReport ? (
              <ClassReportContent report={classReport} />
            ) : null
          )}
        </TabsContent>

        <TabsContent value="deck" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecione um Deck</CardTitle>
              <CardDescription>Visualize a performance de um deck específico</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder={decksLoading ? "Carregando..." : "Selecione um deck"} />
                </SelectTrigger>
                <SelectContent>
                  {decks.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.title} ({d.cards_count} cards)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedDeckId && (
            deckPerformanceLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : deckPerformance ? (
              <DeckPerformanceContent performance={deckPerformance} />
            ) : null
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewContent({ overview }: { overview: any }) {
  const kpis = [
    { label: 'Turmas', value: overview.total_classes, icon: Users },
    { label: 'Alunos', value: overview.total_students, icon: Users },
    { label: 'Decks', value: overview.total_decks, icon: BookOpen },
    { label: 'Cards', value: overview.total_cards, icon: Target },
    { label: 'Atribuições', value: overview.total_assignments, icon: TrendingUp },
  ];

  const chartData = [
    { name: 'Progresso Médio', value: Math.round(overview.avg_student_progress) },
    { name: 'Precisão Média', value: Math.round(overview.avg_student_accuracy) },
  ];

  const chartConfig = {
    value: { label: 'Porcentagem', color: 'hsl(262.1 83.3% 57.8%)' },
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-card">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">{k.label}</CardTitle>
              <k.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Desempenho dos Alunos</CardTitle>
            <CardDescription>Média de progresso e precisão</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-[200px]">
              <BarChart data={chartData} layout="vertical" margin={{ left: 12, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} activeBar={<Rectangle fill="var(--color-value)" stroke="var(--color-value)" />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>Estatísticas gerais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total de turmas</span>
              <span className="font-bold">{overview.total_classes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total de alunos</span>
              <span className="font-bold">{overview.total_students}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Decks criados</span>
              <span className="font-bold">{overview.total_decks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cards criados</span>
              <span className="font-bold">{overview.total_cards}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Progresso médio</span>
              <span className="font-bold">{Math.round(overview.avg_student_progress)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Precisão média</span>
              <span className="font-bold">{Math.round(overview.avg_student_accuracy)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ClassReportContent({ report }: { report: any }) {
  const chartData = report.students.map((s: any) => ({
    name: s.student_name.length > 12 ? s.student_name.substring(0, 12) + '...' : s.student_name,
    progresso: s.progress_percent,
    precisao: s.accuracy,
  }));

  const chartConfig = {
    progresso: { label: 'Progresso', color: 'hsl(262.1 83.3% 57.8%)' },
    precisao: { label: 'Precisão', color: 'hsl(142.1 76.2% 36.3%)' },
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.class_name}</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.total_students}</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.avg_progress}%</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.avg_accuracy}%</div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Desempenho por Aluno</CardTitle>
            <CardDescription>Progresso e precisão de cada aluno</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-[300px]">
              <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} width={30} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="progresso" fill="var(--color-progresso)" radius={4} />
                <Bar dataKey="precisao" fill="var(--color-precisao)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Detalhes por Aluno</CardTitle>
          <CardDescription>Estatísticas individuais de cada aluno</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Aluno</th>
                  <th className="text-left py-3 font-medium">Email</th>
                  <th className="text-center py-3 font-medium">Cards</th>
                  <th className="text-center py-3 font-medium">Aprendidos</th>
                  <th className="text-center py-3 font-medium">Progresso</th>
                  <th className="text-center py-3 font-medium">Precisão</th>
                  <th className="text-center py-3 font-medium">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {report.students.map((student: any) => (
                  <tr key={student.student_id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-medium">{student.student_name}</td>
                    <td className="py-3 text-muted-foreground">{student.student_email}</td>
                    <td className="text-center py-3">{student.total_cards}</td>
                    <td className="text-center py-3">{student.learned}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress_percent} className="w-16 h-2" />
                        <span className="text-xs">{student.progress_percent}%</span>
                      </div>
                    </td>
                    <td className="text-center py-3">
                      <span className={student.accuracy >= 70 ? 'text-green-600' : student.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                        {student.accuracy}%
                      </span>
                    </td>
                    <td className="text-center py-3">{student.time_spent_minutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function DeckPerformanceContent({ performance }: { performance: any }) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deck</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{performance.deck_title}</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.total_cards}</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alunos Estudando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.students_count}</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Precisão Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.avg_accuracy}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Progresso Médio</CardTitle>
            <CardDescription>Percentual médio de conclusão do deck</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={performance.avg_progress} className="flex-1 h-4" />
              <span className="text-2xl font-bold">{performance.avg_progress}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Precisão Média</CardTitle>
            <CardDescription>Taxa de acerto dos alunos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={performance.avg_accuracy} className="flex-1 h-4" />
              <span className="text-2xl font-bold">{performance.avg_accuracy}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {performance.hardest_card && (
          <Card className="shadow-card border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Card Mais Difícil</CardTitle>
              <CardDescription>Card com menor taxa de acerto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{performance.hardest_card.front}</p>
                <div className="flex items-center gap-2">
                  <Progress value={performance.hardest_card.accuracy} className="flex-1 h-2" />
                  <span className="text-sm text-red-600 font-medium">{performance.hardest_card.accuracy}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {performance.easiest_card && (
          <Card className="shadow-card border-green-200">
            <CardHeader>
              <CardTitle className="text-green-600">Card Mais Fácil</CardTitle>
              <CardDescription>Card com maior taxa de acerto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{performance.easiest_card.front}</p>
                <div className="flex items-center gap-2">
                  <Progress value={performance.easiest_card.accuracy} className="flex-1 h-2" />
                  <span className="text-sm text-green-600 font-medium">{performance.easiest_card.accuracy}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

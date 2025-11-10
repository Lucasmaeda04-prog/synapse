import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Brain, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDecks } from '@/hooks/api/useDecks';
import { useClasses } from '@/hooks/api/useClasses';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  
  // Buscar decks do backend
  const { data: decksData, isLoading: decksLoading, isError: decksError } = useDecks({
    mine: isTeacher, // Se for professor, buscar apenas seus decks
    limit: 100, // Buscar muitos para ter estatísticas completas
  });

  // Buscar classes do backend
  const { data: classesData, isLoading: classesLoading, isError: classesError } = useClasses({
    limit: 100, // Buscar muitas para ter estatísticas completas
  });

  const decks = decksData?.data || [];
  const classes = classesData?.data || [];
  
  // Calcular total de cards
  const totalCards = decks.reduce((acc, deck) => acc + (deck.cards_count || 0), 0);
  
  // Para alunos, filtrar classes onde ele está
  const userClasses = isTeacher 
    ? classes 
    : classes.filter(c => c.student_ids?.includes(user?.id || ''));
  
  const isLoading = decksLoading || classesLoading;
  const hasError = decksError || classesError;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Olá, {user?.name}! 👋</h1>
          <p className="text-muted-foreground">
            Erro ao carregar dados. Tente recarregar a página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Olá, {user?.name}! 👋</h1>
        <p className="text-muted-foreground">
          {isTeacher ? 'Gerencie seus decks e turmas' : 'Continue seus estudos'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decks.length}</div>
            <p className="text-xs text-muted-foreground">
              {isTeacher ? 'criados por você' : 'disponíveis'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turmas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userClasses.length}</div>
            <p className="text-xs text-muted-foreground">
              {isTeacher ? 'sob sua responsabilidade' : 'que você participa'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCards}</div>
            <p className="text-xs text-muted-foreground">total de flashcards</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">em desenvolvimento</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isTeacher ? (
              <>
                <Link to="/decks/new" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Criar Novo Deck
                  </Button>
                </Link>
                <Link to="/classes/new" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Criar Nova Turma
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/study" className="block">
                <Button className="w-full justify-start" variant="gradient">
                  <Brain className="mr-2 h-4 w-4" />
                  Começar a Estudar
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Decks Recentes</CardTitle>
            <CardDescription>Seus decks mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            {decks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isTeacher ? 'Nenhum deck criado ainda' : 'Nenhum deck disponível'}
              </p>
            ) : (
              <div className="space-y-3">
                {decks.slice(0, 3).map((deck) => (
                  <div key={deck._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div>
                      <p className="font-medium">{deck.title}</p>
                      <p className="text-sm text-muted-foreground">{deck.cards_count || 0} cards</p>
                    </div>
                    <Link to={`/decks/${deck._id}`}>
                      <Button size="sm" variant="ghost">Ver</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

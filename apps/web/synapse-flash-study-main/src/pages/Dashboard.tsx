import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Brain, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockDecks, mockClasses } from '@/lib/mockData';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const isTeacher = user?.role === 'TEACHER';
  const userDecks = isTeacher ? mockDecks.filter(d => d.teacherId === user.id) : mockDecks;
  const userClasses = isTeacher ? mockClasses.filter(c => c.teacherId === user.id) : mockClasses.filter(c => c.studentIds.includes(user?.id || ''));

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
            <div className="text-2xl font-bold">{userDecks.length}</div>
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
            <div className="text-2xl font-bold">
              {userDecks.reduce((acc, deck) => acc + deck.cards.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">total de flashcards</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">de retenção média</p>
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
            <CardDescription>Seus decks mais acessados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userDecks.slice(0, 3).map((deck) => (
                <div key={deck.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium">{deck.title}</p>
                    <p className="text-sm text-muted-foreground">{deck.cards.length} cards</p>
                  </div>
                  <Link to={`/decks/${deck.id}`}>
                    <Button size="sm" variant="ghost">Ver</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

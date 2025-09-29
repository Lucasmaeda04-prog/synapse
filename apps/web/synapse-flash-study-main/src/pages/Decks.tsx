import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, BookOpen, Calendar } from 'lucide-react';
import { mockDecks } from '@/lib/mockData';

export default function Decks() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const isTeacher = user?.role === 'teacher';
  const userDecks = isTeacher ? mockDecks.filter(d => d.teacherId === user.id) : mockDecks;
  const filteredDecks = userDecks.filter(deck => 
    deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Meus Decks</h1>
          <p className="text-muted-foreground">
            {isTeacher ? 'Gerencie seus decks de flashcards' : 'Estude com flashcards'}
          </p>
        </div>
        {isTeacher && (
          <Link to="/decks/new">
            <Button variant="gradient" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Novo Deck
            </Button>
          </Link>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar decks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDecks.map((deck) => (
          <Card key={deck.id} className="shadow-card hover:shadow-elevated transition-all group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <Badge variant="secondary">{deck.cards.length} cards</Badge>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                {deck.title}
              </CardTitle>
              <CardDescription>{deck.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {deck.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                {deck.createdAt.toLocaleDateString('pt-BR')}
              </div>
              <div className="flex gap-2">
                <Link to={`/decks/${deck.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">Ver Deck</Button>
                </Link>
                {!isTeacher && (
                  <Link to={`/study/${deck.id}`} className="flex-1">
                    <Button variant="gradient" className="w-full">Estudar</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDecks.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum deck encontrado</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? 'Tente outro termo de busca' : isTeacher ? 'Crie seu primeiro deck' : 'Aguarde seu professor criar decks'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

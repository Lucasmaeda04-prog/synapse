import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDeckById, addCardToDeck } from '@/lib/mockService';
import { Card as UiCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DeckDetail() {
  const { deckId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [version, setVersion] = useState(0);
  const deck = useMemo(() => (deckId ? getDeckById(deckId) : undefined), [deckId, version]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!deck) return <Navigate to="/decks" />;

  const canEdit = user?.role === 'teacher' && deck.teacherId === user?.id;

  const addCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId) return;
    addCardToDeck(deckId, { front, back });
    setFront('');
    setBack('');
    setVersion((v) => v + 1);
  };

  return (
    <div className="space-y-6">
      <UiCard className="shadow-card">
        <CardHeader>
          <CardTitle>{deck.title}</CardTitle>
          <CardDescription>{deck.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {deck.tags.map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">{deck.cards.length} cards</div>
        </CardContent>
      </UiCard>

      {canEdit && (
        <UiCard className="shadow-card">
          <CardHeader>
            <CardTitle>Novo Card</CardTitle>
            <CardDescription>Adicione rapidamente um flashcard ao deck</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addCard} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Frente</label>
                <Input value={front} onChange={(e) => setFront(e.target.value)} required placeholder="Pergunta / termo" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Verso</label>
                <Textarea value={back} onChange={(e) => setBack(e.target.value)} required placeholder="Resposta / definição" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="gradient">Adicionar</Button>
              </div>
            </form>
          </CardContent>
        </UiCard>
      )}

      <UiCard className="shadow-card">
        <CardHeader>
          <CardTitle>Cards</CardTitle>
          <CardDescription>Lista de flashcards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deck.cards.map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-muted/50">
                <div className="font-medium">{c.front}</div>
                <div className="text-sm text-muted-foreground">{c.back}</div>
              </div>
            ))}
            {deck.cards.length === 0 && (
              <div className="text-sm text-muted-foreground">Nenhum card ainda.</div>
            )}
          </div>
        </CardContent>
      </UiCard>
    </div>
  );
}

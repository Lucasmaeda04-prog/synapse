import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDeckById, getStudyQueue, submitReview } from '@/lib/mockService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Study() {
  const { deckId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const deck = useMemo(() => (deckId ? getDeckById(deckId) : undefined), [deckId]);
  const initialQueue = useMemo(() => (deckId && user ? getStudyQueue(deckId, user.id) : []), [deckId, user]);
  const [queue, setQueue] = useState(initialQueue);
  const [showBack, setShowBack] = useState(false);
  const [done, setDone] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!deck) return <Navigate to="/decks" />;

  const current = queue[0];

  const reveal = () => setShowBack(true);

  const answer = (rating: 0 | 1 | 2 | 3) => {
    submitReview(current, rating);
    const next = queue.slice(1);
    setQueue(next);
    setShowBack(false);
    if (next.length === 0) setDone(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Estudo — {deck.title}</CardTitle>
          <CardDescription>
            {done ? 'Sessão concluída!' : `${queue.length} restante(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!done && current && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Frente</div>
                <div className="text-lg font-medium">{current.front}</div>
              </div>
              {showBack ? (
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Verso</div>
                  <div className="text-lg">{current.back}</div>
                </div>
              ) : (
                <Button variant="outline" onClick={reveal}>Mostrar resposta</Button>
              )}
              {showBack && (
                <div className="grid grid-cols-4 gap-2">
                  <Button variant="destructive" onClick={() => answer(0)}>Again</Button>
                  <Button variant="secondary" onClick={() => answer(1)}>Hard</Button>
                  <Button variant="outline" onClick={() => answer(2)}>Good</Button>
                  <Button variant="gradient" onClick={() => answer(3)}>Easy</Button>
                </div>
              )}
            </div>
          )}
          {done && (
            <div className="text-center py-8">
              <div className="text-2xl font-semibold mb-2">Parabéns!</div>
              <div className="text-muted-foreground">Você finalizou a sessão.</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


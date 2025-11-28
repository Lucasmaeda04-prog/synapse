import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Timer, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDeck } from "@/hooks/api/useDecks";
import { useStudyQueue, useSubmitReview, useStudyProgress } from "@/hooks/api/useStudy";
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import type { CardInQueue } from "@/lib/api/types";

type Rating = 0 | 1 | 2 | 3; // Again | Hard | Good | Easy

export default function StudySRS() {
  const { deckId } = useParams<{ deckId: string }>();
  const resolvedDeckId = deckId ?? "";
  const { isAuthenticated } = useAuth();

  const { data: deck, isLoading: isDeckLoading, isError: deckError } = useDeck(resolvedDeckId);
  const { data: queueData, isLoading: isQueueLoading, isError: queueError, refetch: refetchQueue } = useStudyQueue(
    { deckId: resolvedDeckId, limit: 20 },
    !!resolvedDeckId
  );
  const { data: progressData } = useStudyProgress(
    { deckId: resolvedDeckId },
    !!resolvedDeckId
  );
  const submitReview = useSubmitReview();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const cards = queueData?.cards ?? [];
  const totalCards = queueData?.total ?? 0;
  const currentCard: CardInQueue | undefined = cards[currentIndex];
  const progress = progressData?.decks?.find((d) => d.deck_id === resolvedDeckId);

  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setStartTime(Date.now());
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
  }, [resolvedDeckId]);

  useEffect(() => {
    // Reset timer when showing new card
    if (!showAnswer) {
      setStartTime(Date.now());
    }
  }, [currentIndex, showAnswer]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!deckId) return <Navigate to="/decks" replace />;

  const handleToggle = () => setShowAnswer((prev) => !prev);

  const handleRating = async (rating: Rating) => {
    if (!currentCard || submitReview.isPending) return;

    const elapsedMs = Date.now() - startTime;

    try {
      await submitReview.mutateAsync({
        card_id: currentCard.card_id,
        deck_id: currentCard.deck_id,
        rating,
        elapsed_ms: elapsedMs,
      });

      // Atualizar estatísticas locais
      setSessionStats((prev) => {
        const key = ['again', 'hard', 'good', 'easy'][rating] as keyof typeof prev;
        return { ...prev, [key]: prev[key] + 1 };
      });

      // Ir para o próximo card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setShowAnswer(false);
      } else {
        // Fim da sessão - recarregar fila
        await refetchQueue();
        setCurrentIndex(0);
        setShowAnswer(false);
      }
    } catch (error) {
      console.error('Erro ao submeter revisão:', error);
    }
  };

  const isCompleted = cards.length === 0 && !isQueueLoading;
  const totalReviewed = Object.values(sessionStats).reduce((a, b) => a + b, 0);

  const renderStudyContent = () => {
    if (isDeckLoading || isQueueLoading) {
      return (
        <UiCard className="shadow-card w-full">
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Carregando cards para estudo...
            </p>
          </CardContent>
        </UiCard>
      );
    }

    if (deckError || queueError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Não foi possível carregar este deck. Tente novamente ou escolha outro deck.
          </AlertDescription>
        </Alert>
      );
    }

    if (isCompleted) {
      return (
        <>
          <UiCard className="shadow-card w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-lg font-semibold flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Sessão concluída!
              </CardTitle>
              <CardDescription>
                {totalReviewed === 0
                  ? "Não há cards para revisar agora"
                  : "Você completou todos os cards disponíveis"}
              </CardDescription>
            </CardHeader>
            {totalReviewed > 0 && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-red-50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">Repetir</p>
                    <p className="text-2xl font-semibold text-red-600">
                      {sessionStats.again}
                    </p>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">Difícil</p>
                    <p className="text-2xl font-semibold text-orange-600">
                      {sessionStats.hard}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">Bom</p>
                    <p className="text-2xl font-semibold text-green-600">
                      {sessionStats.good}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">Fácil</p>
                    <p className="text-2xl font-semibold text-blue-600">
                      {sessionStats.easy}
                    </p>
                  </div>
                </div>
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">Total revisado</p>
                  <p className="text-3xl font-bold text-primary">{totalReviewed}</p>
                </div>
              </CardContent>
            )}
          </UiCard>
          <div className="p-6 pt-0 flex justify-center mt-7">
            <Button asChild variant="gradient">
              <Link to="/decks">Voltar aos decks</Link>
            </Button>
          </div>
        </>
      );
    }

    if (!currentCard) return null;

    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Card {currentIndex + 1} de {cards.length}</span>
            <span>{currentCard.is_new ? "🆕 Novo" : "🔄 Revisão"}</span>
          </div>
          <Progress value={(currentIndex / cards.length) * 100} className="h-2" />
        </div>

        {/* Card display */}
        <UiCard className="shadow-card border border-primary/10 w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-sm font-semibold tracking-wide text-primary uppercase">
              {showAnswer ? "Resposta" : "Pergunta"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            <div className="min-h-[200px] flex items-center justify-center text-center px-4">
              <p className="text-lg leading-relaxed font-semibold">
                {showAnswer ? currentCard.back : currentCard.front}
              </p>
            </div>
          </CardContent>
        </UiCard>

        {!showAnswer ? (
          <Button
            size="lg"
            variant="gradient"
            className="w-full"
            onClick={handleToggle}
          >
            Mostrar Resposta
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground mb-2">
              Como você avalia sua recordação?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="default"
                variant="outline"
                className="border-red-400 text-red-600 hover:bg-red-400 hover:text-white"
                onClick={() => handleRating(0)}
                disabled={submitReview.isPending}
              >
                😵 Repetir
              </Button>
              <Button
                size="default"
                variant="outline"
                className="border-orange-400 text-orange-600 hover:bg-orange-400 hover:text-white"
                onClick={() => handleRating(1)}
                disabled={submitReview.isPending}
              >
                😰 Difícil
              </Button>
              <Button
                size="default"
                variant="outline"
                className="border-green-400 text-green-600 hover:bg-green-400 hover:text-white"
                onClick={() => handleRating(2)}
                disabled={submitReview.isPending}
              >
                😊 Bom
              </Button>
              <Button
                size="default"
                variant="outline"
                className="border-blue-400 text-blue-600 hover:bg-blue-400 hover:text-white"
                onClick={() => handleRating(3)}
                disabled={submitReview.isPending}
              >
                😎 Fácil
              </Button>
            </div>
          </div>
        )}

        {submitReview.isPending && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Salvando...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto min-h-[calc(100vh-11rem)]">
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1.5fr)_1fr] items-start">
        <div className="flex flex-col">
          <Link
            to="/decks"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Decks
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
          {renderStudyContent()}
        </div>

        <div className="text-right space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Deck selecionado</p>
            {deck ? (
              <div className="space-y-1 text-sm">
                <p className="text-base font-semibold text-foreground">
                  {deck.title}
                </p>
                {deck.description && (
                  <p className="text-muted-foreground line-clamp-4">
                    {deck.description}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            )}
          </div>

          {progress && (
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <p className="text-sm font-semibold">Progresso</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total de cards:</span>
                  <span className="font-medium text-foreground">{progress.total_cards}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aprendidos:</span>
                  <span className="font-medium text-green-600">{progress.learned}</span>
                </div>
                <div className="flex justify-between">
                  <span>Para hoje:</span>
                  <span className="font-medium text-primary">{progress.due_today}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

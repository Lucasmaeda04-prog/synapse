import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDeck } from "@/hooks/api/useDecks";
import { useCards } from "@/hooks/api/useCards";
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type DeckApi = {
  title: string;
  description?: string;
  cards_count?: number;
  created_at?: string | Date;
  updated_at?: string | Date;
};

export default function Study() {
  const { deckId } = useParams<{ deckId: string }>();
  const resolvedDeckId = deckId ?? "";
  const { isAuthenticated } = useAuth();
  const {
    data: deck,
    isLoading: isDeckLoading,
    isError: deckError,
  } = useDeck(resolvedDeckId);
  const {
    data: cards,
    isLoading: isCardsLoading,
    isError: cardsError,
  } = useCards(resolvedDeckId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({
    answered: 0,
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setStats({ answered: 0, correct: 0, incorrect: 0, skipped: 0 });
    setCompleted(false);
  }, [resolvedDeckId, cards?.length]);

  const currentCard = useMemo(() => {
    if (!cards || cards.length === 0) return undefined;
    return cards[currentIndex] ?? cards[0];
  }, [cards, currentIndex]);

  const totalCards = cards?.length ?? 0;
  const loading = isDeckLoading || isCardsLoading;
  const hasError = deckError || cardsError;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!deckId) return <Navigate to="/decks" replace />;

  const handleToggle = () => setShowAnswer((prev) => !prev);

  const goToNext = () => {
    if (!cards || cards.length === 0) return;
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= cards.length) return prev;
      return nextIndex;
    });
    setShowAnswer(false);
  };

  const handleResult = (isCorrect: boolean) => {
    if (!cards || cards.length === 0 || completed) return;

    setStats((prev) => {
      const updated = {
        answered: prev.answered + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        skipped: prev.skipped,
      };

      const totalDone = updated.answered + updated.skipped;
      if (totalDone >= totalCards) {
        setCompleted(true);
      } else {
        goToNext();
      }
      return updated;
    });

    setShowAnswer(false);
  };

  const handleSkip = () => {
    if (!cards || cards.length === 0 || completed) return;

    setStats((prev) => {
      const updated = {
        ...prev,
        skipped: prev.skipped + 1,
      };

      const totalDone = updated.answered + updated.skipped;
      if (totalDone >= totalCards) {
        setCompleted(true);
      } else {
        goToNext();
      }
      return updated;
    });

    setShowAnswer(false);
  };

  const renderStudyContent = () => {
    if (loading) {
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

    if (hasError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Não foi possível carregar este deck. Tente novamente ou escolha
            outro deck.
          </AlertDescription>
        </Alert>
      );
    }

    if (totalCards === 0) {
      return (
        <UiCard className="shadow-card w-full">
          <CardContent className="text-center py-10 space-y-4">
            <CardTitle>Este deck ainda não possui cards para estudo.</CardTitle>
            <CardDescription>
              Retorne mais tarde ou solicite ao professor que adicione cards.
            </CardDescription>
          </CardContent>
        </UiCard>
      );
    }

    if (completed) {
      const skipped = stats.skipped;
      const accuracy =
        stats.answered > 0
          ? Math.round((stats.correct / stats.answered) * 100)
          : 0;
      return (
        <>
          <UiCard className="shadow-card w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-lg font-semibold">
                Sessão concluída
              </CardTitle>
              <CardDescription>Resumo rápido do seu desempenho</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/40 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Respondidas</p>
                  <p className="text-2xl font-semibold">{stats.answered}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Acertos</p>
                  <p className="text-2xl font-semibold text-emerald-600">
                    {stats.correct}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Erros</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {stats.incorrect}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Puladas</p>
                  <p className="text-2xl font-semibold">{skipped}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Precisão</p>
                <p className="text-3xl font-bold text-primary">{accuracy}%</p>
              </div>
            </CardContent>
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
        <UiCard className="shadow-card border border-primary/10 w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-sm font-semibold tracking-wide text-primary uppercase">
              {showAnswer ? "Resposta" : "Pergunta"}
            </CardTitle>
            <CardDescription>
              Card {currentIndex + 1} de {totalCards}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            <div className="h-[250px] flex items-center justify-center text-center px-4">
              <p className="text-lg leading-relaxed font-semibold">
                {showAnswer ? currentCard.back : currentCard.front}
              </p>
            </div>
          </CardContent>
        </UiCard>

        <Button
          size="default"
          variant="gradient"
          className="w-full"
          onClick={handleToggle}
        >
          {showAnswer ? "Ver pergunta" : "Ver resposta"}
        </Button>

        <div className="w-full grid grid-cols-2 gap-3">
          <Button
            size="default"
            variant="outline"
            className="flex-1 border-red-400 text-red-400 hover:bg-primary/10 hover:bg-red-400 hover:text-white hover:border-red-400"
            onClick={() => handleResult(false)}
            disabled={totalCards === 0}
          >
            Errei
          </Button>
          <Button
            size="default"
            variant="outline"
            className="flex-1 border-emerald-400 text-emerald-500 hover:bg-emerald-400 hover:text-white hover:border-emerald-400"
            onClick={() => handleResult(true)}
            disabled={totalCards === 0}
          >
            Acertei
          </Button>
        </div>

        {!completed && (
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex items-center gap-1 hover:text-primary"
            >
              Pular
            </button>
          </div>
        )}
      </div>
    );
  };

  const deckMeta = deck as DeckApi | undefined;
  const cardsCount = deckMeta?.cards_count ?? cards?.length ?? 0;
  const updatedAt = deckMeta?.updated_at ?? deckMeta?.created_at;
  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleDateString("pt-BR")
    : "--";

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

        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-2">Deck selecionado</p>
          {deckMeta ? (
            <div className="space-y-1 text-sm">
              <p className="text-base font-semibold text-foreground">
                {deckMeta.title}
              </p>
              {deckMeta.description && (
                <p className="text-muted-foreground line-clamp-4">
                  {deckMeta.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground/80">
                {cardsCount} cards • Atualizado em {updatedLabel}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecione um deck na lista para começar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

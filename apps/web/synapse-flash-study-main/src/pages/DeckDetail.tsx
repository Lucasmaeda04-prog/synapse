import { useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeck, useUpdateDeck, useDeleteDeck } from "@/hooks/api/useDecks";
import {
  useCards,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
} from "@/hooks/api/useCards";
import { AlertCircle, Loader2, Pencil, Trash2, Plus, X } from "lucide-react";

export default function DeckDetail() {
  const { deckId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");

  // Estados para cards
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [cardHints, setCardHints] = useState("");

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardFront, setEditCardFront] = useState("");
  const [editCardBack, setEditCardBack] = useState("");
  const [editCardHints, setEditCardHints] = useState("");

  // Buscar deck da API
  const { data: deck, isLoading, isError, error } = useDeck(deckId || "");
  const updateDeck = useUpdateDeck();
  const deleteDeck = useDeleteDeck();

  // Buscar cards do deck
  const {
    data: cards,
    isLoading: isLoadingCards,
    isError: isErrorCards,
  } = useCards(deckId || "");
  const createCard = useCreateCard(deckId || "");
  const updateCard = useUpdateCard(deckId || "");
  const deleteCard = useDeleteCard(deckId || "");

  if (!isAuthenticated) return <Navigate to="/login" />;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <UiCard>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/4" />
          </CardContent>
        </UiCard>
      </div>
    );
  }

  // Error state
  if (isError || !deck) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Deck não encontrado"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/decks")}>Voltar para Decks</Button>
      </div>
    );
  }

  // TODO: Quando integrar auth real, validar: deck.owner_id === user?.id
  const canEdit = user?.role === "TEACHER"; // Por enquanto, qualquer professor pode editar

  const handleEdit = () => {
    setEditTitle(deck.title);
    setEditDescription(deck.description || "");
    setEditTags(deck.tags.join(", "));
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId) return;

    const tagsArray = editTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await updateDeck.mutateAsync({
        id: deckId,
        data: {
          title: editTitle,
          description: editDescription || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar deck:", error);
    }
  };

  const handleDelete = async () => {
    if (!deckId) return;
    try {
      await deleteDeck.mutateAsync(deckId);
      navigate("/decks");
    } catch (error) {
      console.error("Erro ao deletar deck:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle("");
    setEditDescription("");
    setEditTags("");
  };

  // Handlers para cards
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckId || !cardFront.trim() || !cardBack.trim()) return;

    try {
      const hints = cardHints
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);

      await createCard.mutateAsync({
        front: cardFront.trim(),
        back: cardBack.trim(),
        hints: hints.length > 0 ? hints : undefined,
      });

      // Limpar formulário
      setCardFront("");
      setCardBack("");
      setCardHints("");
      setIsAddingCard(false);
    } catch (error) {
      console.error("Erro ao criar card:", error);
    }
  };

  const handleStartEditCard = (card: any) => {
    setEditingCardId(card._id);
    setEditCardFront(card.front);
    setEditCardBack(card.back);
    setEditCardHints(card.hints?.join(", ") || "");
  };

  const handleSaveEditCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCardId || !editCardFront.trim() || !editCardBack.trim()) return;

    try {
      const hints = editCardHints
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);

      await updateCard.mutateAsync({
        id: editingCardId,
        data: {
          front: editCardFront.trim(),
          back: editCardBack.trim(),
          hints: hints.length > 0 ? hints : undefined,
        },
      });

      handleCancelEditCard();
    } catch (error) {
      console.error("Erro ao atualizar card:", error);
    }
  };

  const handleCancelEditCard = () => {
    setEditingCardId(null);
    setEditCardFront("");
    setEditCardBack("");
    setEditCardHints("");
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCard.mutateAsync(cardId);
    } catch (error) {
      console.error("Erro ao deletar card:", error);
    }
  };

  return (
    <div className="space-y-6">
      <UiCard className="shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <CardTitle>{deck.title}</CardTitle>
                  <CardDescription>
                    {deck.description || "Sem descrição"}
                  </CardDescription>
                </>
              ) : (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Título
                    </label>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                      disabled={updateDeck.isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Descrição
                    </label>
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      disabled={updateDeck.isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tags (separadas por vírgula)
                    </label>
                    <Input
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="matemática, álgebra"
                      disabled={updateDeck.isPending}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="gradient"
                      disabled={updateDeck.isPending || !editTitle.trim()}
                    >
                      {updateDeck.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={updateDeck.isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </div>
            {canEdit && !isEditing && (
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="icon" onClick={handleEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja deletar este deck? Esta ação não
                        pode ser desfeita e todos os cards associados serão
                        removidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleteDeck.isPending}
                      >
                        {deleteDeck.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {deck.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
                {deck.tags.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    Sem tags
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {deck.cards_count} {deck.cards_count === 1 ? "card" : "cards"}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Criado em{" "}
                {new Date(deck.created_at).toLocaleDateString("pt-BR")}
              </div>
            </>
          )}
        </CardContent>
      </UiCard>

      {/* Cards Management Section */}
      <UiCard className="shadow-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Cards</CardTitle>
              <CardDescription>
                {deck.cards_count === 0
                  ? "Nenhum card ainda"
                  : `${deck.cards_count} ${
                      deck.cards_count === 1 ? "card" : "cards"
                    }`}
              </CardDescription>
            </div>
            {canEdit && !isAddingCard && (
              <Button onClick={() => setIsAddingCard(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Card
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Card Form */}
          {isAddingCard && (
            <div className="border rounded-lg p-4 mb-4 bg-muted/50">
              <h3 className="font-semibold mb-3">Novo Card</h3>
              <form onSubmit={handleAddCard} className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Frente (Pergunta) *
                  </label>
                  <Textarea
                    value={cardFront}
                    onChange={(e) => setCardFront(e.target.value)}
                    placeholder="Digite a pergunta ou termo..."
                    required
                    maxLength={1000}
                    rows={3}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {cardFront.length}/1000 caracteres
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Verso (Resposta) *
                  </label>
                  <Textarea
                    value={cardBack}
                    onChange={(e) => setCardBack(e.target.value)}
                    placeholder="Digite a resposta ou definição..."
                    required
                    maxLength={2000}
                    rows={4}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {cardBack.length}/2000 caracteres
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Dicas (opcional)
                  </label>
                  <Input
                    value={cardHints}
                    onChange={(e) => setCardHints(e.target.value)}
                    placeholder="Digite dicas separadas por vírgula..."
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Separe múltiplas dicas com vírgulas
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingCard(false);
                      setCardFront("");
                      setCardBack("");
                      setCardHints("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCard.isPending || !cardFront || !cardBack}
                  >
                    {createCard.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Adicionar
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Cards List */}
          {isLoadingCards ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : isErrorCards ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Não foi possível carregar os cards deste deck. Tente novamente
                mais tarde.
              </AlertDescription>
            </Alert>
          ) : cards && cards.length > 0 ? (
            <div className="space-y-3">
              {cards.map((card) => (
                <div
                  key={card._id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  {editingCardId === card._id ? (
                    // Edit Mode
                    <form onSubmit={handleSaveEditCard} className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Frente (Pergunta) *
                        </label>
                        <Textarea
                          value={editCardFront}
                          onChange={(e) => setEditCardFront(e.target.value)}
                          required
                          maxLength={1000}
                          rows={3}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {editCardFront.length}/1000 caracteres
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Verso (Resposta) *
                        </label>
                        <Textarea
                          value={editCardBack}
                          onChange={(e) => setEditCardBack(e.target.value)}
                          required
                          maxLength={2000}
                          rows={4}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {editCardBack.length}/2000 caracteres
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Dicas (opcional)
                        </label>
                        <Input
                          value={editCardHints}
                          onChange={(e) => setEditCardHints(e.target.value)}
                          placeholder="Digite dicas separadas por vírgula..."
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEditCard}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            updateCard.isPending ||
                            !editCardFront ||
                            !editCardBack
                          }
                        >
                          {updateCard.isPending && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          Salvar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-muted-foreground mb-1">
                            Frente:
                          </div>
                          <div className="mb-3 whitespace-pre-wrap">
                            {card.front}
                          </div>
                          <div className="font-semibold text-sm text-muted-foreground mb-1">
                            Verso:
                          </div>
                          <div className="mb-3 whitespace-pre-wrap">
                            {card.back}
                          </div>
                          {card.hints && card.hints.length > 0 && (
                            <div>
                              <div className="font-semibold text-sm text-muted-foreground mb-1">
                                Dicas:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {card.hints.map((hint, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs"
                                  >
                                    {hint}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {canEdit && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartEditCard(card)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Tem certeza?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Este card
                                    será permanentemente excluído.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCard(card._id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Criado em{" "}
                        {new Date(card.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">Nenhum card ainda neste deck.</p>
              {canEdit && !isAddingCard && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingCard(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro card
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </UiCard>
    </div>
  );
}

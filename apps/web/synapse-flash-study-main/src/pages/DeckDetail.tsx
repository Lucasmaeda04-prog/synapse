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
import { AlertCircle, Loader2, Pencil, Trash2 } from "lucide-react";

export default function DeckDetail() {
  const { deckId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");

  // Buscar deck da API
  const { data: deck, isLoading, isError, error } = useDeck(deckId || "");
  const updateDeck = useUpdateDeck();
  const deleteDeck = useDeleteDeck();

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
  const canEdit = user?.role === "teacher"; // Por enquanto, qualquer professor pode editar

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

      {/* TODO: Adicionar gerenciamento de cards aqui */}
      <UiCard className="shadow-card">
        <CardHeader>
          <CardTitle>Cards</CardTitle>
          <CardDescription>
            Gerenciamento de cards será implementado em breve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Este deck possui {deck.cards_count}{" "}
            {deck.cards_count === 1 ? "card" : "cards"}. A funcionalidade de
            adicionar e editar cards será implementada em uma próxima etapa.
          </div>
        </CardContent>
      </UiCard>
    </div>
  );
}

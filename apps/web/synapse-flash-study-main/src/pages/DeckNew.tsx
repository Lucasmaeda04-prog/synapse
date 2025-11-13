import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateDeck } from "@/hooks/api/useDecks";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function DeckNew() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  // Cards being created with the deck
  const [cards, setCards] = useState<
    Array<{ front: string; back: string; hints: string }>
  >([]);

  const createDeck = useCreateDeck();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== "TEACHER" && user?.role !== "ADMIN")
    return <Navigate to="/dashboard" />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // validate cards: if any card exists, front and back are required
      const invalidCard = cards.some((c) => !c.front.trim() || !c.back.trim());
      if (invalidCard) {
        // simple UI feedback — could be replaced with toast
        console.error(
          "Há cards incompletos. Preencha frente e verso ou remova-os."
        );
        return;
      }

      const cardsPayload = cards.map((c) => ({
        front: c.front.trim(),
        back: c.back.trim(),
        hints: c.hints
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean),
      }));

      await createDeck.mutateAsync({
        title,
        description: description || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        is_public: false,
        cards: cardsPayload.length > 0 ? cardsPayload : undefined,
      });

      navigate("/decks");
    } catch (error) {
      console.error("Erro ao criar deck:", error);
    }
  };

  const addEmptyCard = () => {
    setCards((s) => [...s, { front: "", back: "", hints: "" }]);
  };

  const updateCard = (
    index: number,
    field: "front" | "back" | "hints",
    value: string
  ) => {
    setCards((s) =>
      s.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const removeCard = (index: number) => {
    setCards((s) => s.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Novo Deck</CardTitle>
          <CardDescription>Crie um deck de flashcards</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex.: Matemática Básica"
                disabled={createDeck.isPending}
              />
            </div>
            {/* Cards section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Cards (opcional)</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addEmptyCard}
                  disabled={createDeck.isPending}
                >
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Card
                </Button>
              </div>

              {cards.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Adicione cards agora ou depois na página do deck.
                </p>
              )}

              <div className="space-y-4">
                {cards.map((card, idx) => (
                  <div key={idx} className="p-3 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">Card {idx + 1}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeCard(idx)}
                        disabled={createDeck.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label>Frente *</Label>
                        <Input
                          value={card.front}
                          onChange={(e) =>
                            updateCard(idx, "front", e.target.value)
                          }
                          disabled={createDeck.isPending}
                        />
                      </div>
                      <div>
                        <Label>Verso *</Label>
                        <Textarea
                          value={card.back}
                          onChange={(e) =>
                            updateCard(idx, "back", e.target.value)
                          }
                          rows={3}
                          disabled={createDeck.isPending}
                        />
                      </div>
                      <div>
                        <Label>Dicas (separadas por vírgula)</Label>
                        <Input
                          value={card.hints}
                          onChange={(e) =>
                            updateCard(idx, "hints", e.target.value)
                          }
                          disabled={createDeck.isPending}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição do conteúdo do deck"
                rows={3}
                disabled={createDeck.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">
                Tags{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional, separadas por vírgula)
                </span>
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="matemática, álgebra, básico"
                disabled={createDeck.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Use tags para organizar e facilitar a busca dos seus decks
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/decks")}
                disabled={createDeck.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="gradient"
                type="submit"
                disabled={createDeck.isPending || !title.trim()}
              >
                {createDeck.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {createDeck.isPending ? "Criando..." : "Criar Deck"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

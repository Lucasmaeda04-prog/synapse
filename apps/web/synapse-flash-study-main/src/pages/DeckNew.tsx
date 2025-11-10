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
import { Loader2 } from "lucide-react";

export default function DeckNew() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const createDeck = useCreateDeck();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== "TEACHER" && user?.role !== "ADMIN") return <Navigate to="/dashboard" />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await createDeck.mutateAsync({
        title,
        description: description || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        is_public: false,
      });

      navigate("/decks");
    } catch (error) {
      console.error("Erro ao criar deck:", error);
    }
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

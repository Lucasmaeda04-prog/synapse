import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cardsApi } from "@/lib/api/cards";
import type { Card, CreateCardDto, UpdateCardDto } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";

// Hook para listar cards de um deck
export function useCards(deckId: string) {
  return useQuery({
    queryKey: ["cards", deckId],
    queryFn: () => cardsApi.listByDeck(deckId),
    staleTime: 30000, // 30 segundos
  });
}

// Hook para buscar um card específico
export function useCard(id: string) {
  return useQuery({
    queryKey: ["cards", id],
    queryFn: () => cardsApi.getById(id),
    enabled: !!id,
  });
}

// Hook para criar um card
export function useCreateCard(deckId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateCardDto) => cardsApi.create(deckId, data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["cards", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });

      toast({
        title: "Card criado!",
        description: "O card foi adicionado ao deck com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar card",
        description:
          error.response?.data?.message ||
          "Ocorreu um erro ao criar o card. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

// Hook para atualizar um card
export function useUpdateCard(deckId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardDto }) =>
      cardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks", deckId] });

      toast({
        title: "Card atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar card",
        description:
          error.response?.data?.message ||
          "Ocorreu um erro ao atualizar o card. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

// Hook para deletar um card
export function useDeleteCard(deckId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => cardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks", deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });

      toast({
        title: "Card deletado!",
        description: "O card foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar card",
        description:
          error.response?.data?.message ||
          "Ocorreu um erro ao deletar o card. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

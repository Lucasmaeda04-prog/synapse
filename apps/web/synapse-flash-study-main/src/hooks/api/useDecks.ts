import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { decksApi } from "@/lib/api";
import type {
  CreateDeckDto,
  UpdateDeckDto,
  QueryDeckDto,
} from "@/lib/api/types";
import { toast } from "@/hooks/use-toast";

// Hook para listar decks com filtros e paginação
export function useDecks(params?: QueryDeckDto) {
  return useQuery({
    queryKey: ["decks", params],
    queryFn: () => decksApi.list(params),
    staleTime: 30000, // 30 segundos
  });
}

// Hook para buscar um deck específico
export function useDeck(id: string) {
  return useQuery({
    queryKey: ["decks", id],
    queryFn: () => decksApi.getById(id),
    enabled: !!id,
  });
}

// Hook para criar um novo deck
export function useCreateDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeckDto) => decksApi.create(data),
    onSuccess: () => {
      // Invalida a lista de decks para recarregar
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "Sucesso!",
        description: "Deck criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar deck",
        description:
          error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
}

// Hook para atualizar um deck existente
export function useUpdateDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeckDto }) =>
      decksApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalida o deck específico e a lista
      queryClient.invalidateQueries({ queryKey: ["decks", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "Sucesso!",
        description: "Deck atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar deck",
        description:
          error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
}

// Hook para deletar um deck
export function useDeleteDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => decksApi.delete(id),
    onSuccess: () => {
      // Invalida a lista de decks
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "Sucesso!",
        description: "Deck deletado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar deck",
        description:
          error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
}

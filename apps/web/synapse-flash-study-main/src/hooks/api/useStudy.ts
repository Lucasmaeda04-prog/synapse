import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studyApi } from '@/lib/api';
import type {
  QueueQueryDto,
  QueueResponse,
  CreateReviewDto,
  ReviewResponse,
  ProgressQueryDto,
  ProgressResponse,
} from '@/lib/api/types';

/**
 * Hook para buscar a fila de estudo
 */
export function useStudyQueue(params: QueueQueryDto, enabled = true) {
  return useQuery<QueueResponse, Error>({
    queryKey: ['study', 'queue', params],
    queryFn: () => studyApi.getQueue(params),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para submeter uma revisão
 */
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation<ReviewResponse, Error, CreateReviewDto>({
    mutationFn: (data) => studyApi.submitReview(data),
    onSuccess: (_data, variables) => {
      // Invalidar a fila para atualizar os cards devidos
      queryClient.invalidateQueries({
        queryKey: ['study', 'queue', { deckId: variables.deck_id }],
      });
      // Invalidar o progresso
      queryClient.invalidateQueries({
        queryKey: ['study', 'progress'],
      });
    },
  });
}

/**
 * Hook para buscar o progresso
 */
export function useStudyProgress(params?: ProgressQueryDto, enabled = true) {
  return useQuery<ProgressResponse, Error>({
    queryKey: ['study', 'progress', params],
    queryFn: () => studyApi.getProgress(params),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

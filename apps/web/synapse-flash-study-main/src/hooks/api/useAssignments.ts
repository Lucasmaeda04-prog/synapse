import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignmentsApi } from "@/lib/api";
import type {
  Assignment,
  CreateAssignmentDto,
  QueryAssignmentDto,
} from "@/lib/api/types";
import { toast } from "@/hooks/use-toast";

type ApiErrorResponse = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as ApiErrorResponse).response?.data?.message
  ) {
    return (error as ApiErrorResponse).response!.data!.message!;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
};

export function useAssignments(params?: QueryAssignmentDto) {
  return useQuery({
    queryKey: ["assignments", params],
    queryFn: () => assignmentsApi.list(params),
    enabled: !!params,
    staleTime: 15_000,
  });
}

export function useClassAssignments(classId: string) {
  return useQuery({
    queryKey: ["assignments", "class", classId],
    queryFn: () => assignmentsApi.list({ class_id: classId }),
    enabled: !!classId,
    staleTime: 15_000,
  });
}

export function useAssignDeckToClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentDto) => assignmentsApi.create(data),
    onSuccess: (assignment: Assignment) => {
      if (assignment.class_id) {
        queryClient.invalidateQueries({
          queryKey: ["assignments", "class", assignment.class_id],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["assignments"] });
      }

      toast({
        title: "Deck atribuído!",
        description: "O deck foi vinculado à turma com sucesso.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Erro ao atribuir deck",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useRemoveAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
    }: {
      assignmentId: string;
      classId?: string;
    }) => assignmentsApi.delete(assignmentId),
    onSuccess: (_data, variables) => {
      if (variables.classId) {
        queryClient.setQueryData<Assignment[]>(
          ["assignments", "class", variables.classId],
          (old) =>
            Array.isArray(old)
              ? old.filter((assignment) => assignment._id !== variables.assignmentId)
              : old,
        );
      }

      if (variables.classId) {
        queryClient.invalidateQueries({
          queryKey: ["assignments", "class", variables.classId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["assignments"] });
      }

      toast({
        title: "Deck desatribuído!",
        description: "O deck foi removido da turma.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Erro ao remover deck",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

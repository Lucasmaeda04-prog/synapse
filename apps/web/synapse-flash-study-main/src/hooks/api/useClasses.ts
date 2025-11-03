import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classesApi } from "@/lib/api";
import type {
  CreateClassDto,
  UpdateClassDto,
  QueryClassDto,
  AddStudentsDto,
  RemoveStudentsDto,
} from "@/lib/api/types";
import { toast } from "@/hooks/use-toast";

// Hook para listar classes com filtros e paginação
export function useClasses(params?: QueryClassDto) {
  return useQuery({
    queryKey: ["classes", params],
    queryFn: () => classesApi.list(params),
    staleTime: 30000, // 30 segundos
  });
}

// Hook para buscar uma classe específica
export function useClass(id: string) {
  return useQuery({
    queryKey: ["classes", id],
    queryFn: () => classesApi.getById(id),
    enabled: !!id,
  });
}

// Hook para criar uma nova classe
export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassDto) => classesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({
        title: "Sucesso!",
        description: "Turma criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar turma",
        description:
          error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
}
// Hook para atualizar uma classe existente
export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassDto }) =>
      classesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classes", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({
        title: "Sucesso!",
        description: "Turma atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar turma",
        description:
          error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
}

// Hook para deletar uma classe
export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => classesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({
        title: "Sucesso!",
        description: "Turma deletada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar turma",
        description:
          error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
}

// Hook para adicionar alunos a uma classe
export function useAddStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddStudentsDto }) =>
      classesApi.addStudents(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classes", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({
        title: "Sucesso!",
        description: "Alunos adicionados com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar alunos",
        description:
          error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
}

//Hook para remover alunos de uma classe
export function useRemoveStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RemoveStudentsDto }) =>
      classesApi.removeStudents(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classes", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({
        title: "Sucesso!",
        description: "Alunos removidos com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover alunos",
        description:
          error.response?.data?.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
}

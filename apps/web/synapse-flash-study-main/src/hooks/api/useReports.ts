import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import type {
  StudentOverview,
  DeckAnalytics,
  StudentActivity,
  TeacherOverview,
  ClassReport,
  DeckPerformance,
} from '@/lib/api/types';

/**
 * Hook para buscar visão geral do aluno
 */
export function useStudentOverview(enabled = true) {
  return useQuery<StudentOverview, Error>({
    queryKey: ['reports', 'student', 'overview'],
    queryFn: () => reportsApi.getStudentOverview(),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar analytics de um deck específico (aluno)
 */
export function useStudentDeckAnalytics(deckId: string, enabled = true) {
  return useQuery<DeckAnalytics, Error>({
    queryKey: ['reports', 'student', 'deck', deckId],
    queryFn: () => reportsApi.getStudentDeckAnalytics(deckId),
    enabled: enabled && !!deckId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para buscar histórico de atividade do aluno
 */
export function useStudentActivity(days = 30, enabled = true) {
  return useQuery<StudentActivity, Error>({
    queryKey: ['reports', 'student', 'activity', days],
    queryFn: () => reportsApi.getStudentActivity(days),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para buscar visão geral do professor
 */
export function useTeacherOverview(enabled = true) {
  return useQuery<TeacherOverview, Error>({
    queryKey: ['reports', 'teacher', 'overview'],
    queryFn: () => reportsApi.getTeacherOverview(),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para buscar relatório de uma turma
 */
export function useClassReport(classId: string, enabled = true) {
  return useQuery<ClassReport, Error>({
    queryKey: ['reports', 'teacher', 'class', classId],
    queryFn: () => reportsApi.getClassReport(classId),
    enabled: enabled && !!classId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para buscar performance de um deck
 */
export function useDeckPerformance(deckId: string, enabled = true) {
  return useQuery<DeckPerformance, Error>({
    queryKey: ['reports', 'teacher', 'deck', deckId, 'performance'],
    queryFn: () => reportsApi.getDeckPerformance(deckId),
    enabled: enabled && !!deckId,
    staleTime: 1000 * 60 * 5,
  });
}

import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getClassById, addStudentsToClass, assignDeckToClass, listStudents, listDecksByUser } from '@/lib/mockService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ClassDetail() {
  const { classId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [version, setVersion] = useState(0);
  const klass = useMemo(() => (classId ? getClassById(classId) : undefined), [classId, version]);

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>('');

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!klass) return <Navigate to="/classes" />;

  const canEdit = user?.role === 'teacher' && klass.teacherId === user?.id;
  const allStudents = listStudents();
  const teacherDecks = user ? listDecksByUser(user.id, 'teacher') : [];

  const addStudents = () => {
    if (!selectedStudents.length) return;
    addStudentsToClass(klass.id, selectedStudents);
    setSelectedStudents([]);
    setVersion((v) => v + 1);
  };

  const assignDeck = () => {
    if (!selectedDeck) return;
    assignDeckToClass(klass.id, selectedDeck);
    setSelectedDeck('');
    setVersion((v) => v + 1);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{klass.name}</CardTitle>
          <CardDescription>{klass.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Criada em {klass.createdAt.toLocaleDateString('pt-BR')}</div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Alunos</CardTitle>
          <CardDescription>Gerencie os alunos da turma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {klass.studentIds.map((id) => {
              const s = allStudents.find((x) => x.id === id);
              return <Badge key={id} variant="outline">{s?.name ?? id}</Badge>;
            })}
            {klass.studentIds.length === 0 && (
              <div className="text-sm text-muted-foreground">Nenhum aluno ainda.</div>
            )}
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              <select
                multiple
                className="border rounded-md p-2 flex-1 min-h-[120px]"
                value={selectedStudents}
                onChange={(e) =>
                  setSelectedStudents(Array.from(e.target.selectedOptions).map((o) => o.value))
                }
              >
                {allStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <Button onClick={addStudents} variant="gradient">Adicionar alunos</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Decks Atribuídos</CardTitle>
          <CardDescription>Vincule decks à turma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {klass.assignedDecks.map((id) => {
              const d = teacherDecks.find((x) => x.id === id);
              return <Badge key={id} variant="secondary">{d?.title ?? id}</Badge>;
            })}
            {klass.assignedDecks.length === 0 && (
              <div className="text-sm text-muted-foreground">Nenhum deck atribuído ainda.</div>
            )}
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              <select
                className="border rounded-md p-2 flex-1"
                value={selectedDeck}
                onChange={(e) => setSelectedDeck(e.target.value)}
              >
                <option value="">Selecione um deck</option>
                {teacherDecks.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
              <Button onClick={assignDeck} variant="gradient">Atribuir deck</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

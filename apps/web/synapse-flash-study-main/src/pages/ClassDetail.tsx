import { useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  useClass,
  useUpdateClass,
  useDeleteClass,
  useAddStudents,
  useRemoveStudents,
} from "@/hooks/api/useClasses";
import {
  AlertCircle,
  Loader2,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
} from "lucide-react";

export default function ClassDetail() {
  const { classId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  // Estados para adicionar/remover alunos
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);

  // Buscar turma da API
  const { data: klass, isLoading, isError, error } = useClass(classId || "");
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const addStudents = useAddStudents();
  const removeStudents = useRemoveStudents();

  if (!isAuthenticated) return <Navigate to="/login" />;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError || !klass) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Turma não encontrada"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/classes")}>Voltar para Turmas</Button>
      </div>
    );
  }

  // TODO: Quando integrar auth real, validar: klass.teacher_id === user?.id
  const canEdit = user?.role === "teacher"; // Por enquanto, qualquer professor pode editar

  const handleEdit = () => {
    setEditName(klass.name);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) return;

    try {
      await updateClass.mutateAsync({
        id: classId,
        data: { name: editName },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar turma:", error);
    }
  };

  const handleDelete = async () => {
    if (!classId) return;
    try {
      await deleteClass.mutateAsync(classId);
      navigate("/classes");
    } catch (error) {
      console.error("Erro ao deletar turma:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName("");
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !newStudentEmail.trim()) return;

    try {
      // Por enquanto, vamos simular que o email é o ID do aluno
      // Em produção, você precisaria de um endpoint para buscar aluno por email
      await addStudents.mutateAsync({
        id: classId,
        data: { student_ids: [newStudentEmail.trim()] },
      });
      setNewStudentEmail("");
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!classId) return;

    try {
      await removeStudents.mutateAsync({
        id: classId,
        data: { student_ids: [studentId] },
      });
      setStudentToRemove(null);
    } catch (error) {
      console.error("Erro ao remover aluno:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Principal - Info da Turma */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <CardTitle>{klass.name}</CardTitle>
                  <CardDescription>
                    Criada em{" "}
                    {new Date(klass.created_at).toLocaleDateString("pt-BR")}
                  </CardDescription>
                </>
              ) : (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nome da Turma
                    </label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      disabled={updateClass.isPending}
                      placeholder="Ex.: 9º Ano A"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="gradient"
                      disabled={updateClass.isPending || !editName.trim()}
                    >
                      {updateClass.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={updateClass.isPending}
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
                        Tem certeza que deseja deletar esta turma? Esta ação não
                        pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleteClass.isPending}
                      >
                        {deleteClass.isPending && (
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
            <div className="text-sm text-muted-foreground">
              {klass.students_count}{" "}
              {klass.students_count === 1 ? "aluno" : "alunos"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Alunos */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Alunos</CardTitle>
          <CardDescription>Gerencie os alunos da turma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de alunos */}
          <div>
            <p className="text-sm font-medium mb-2">Alunos matriculados:</p>
            <div className="flex flex-wrap gap-2">
              {klass.student_ids.map((studentId) => (
                <div key={studentId} className="flex items-center gap-1">
                  <Badge variant="outline">{studentId}</Badge>
                  {canEdit && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setStudentToRemove(studentId)}
                        >
                          <UserMinus className="h-3 w-3 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover aluno</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover este aluno da turma?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setStudentToRemove(null)}
                          >
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveStudent(studentId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={removeStudents.isPending}
                          >
                            {removeStudents.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
              {klass.student_ids.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Nenhum aluno matriculado ainda.
                </div>
              )}
            </div>
          </div>

          {/* Adicionar aluno */}
          {canEdit && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Adicionar aluno:</p>
              <form onSubmit={handleAddStudent} className="flex gap-2">
                <Input
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="ID ou email do aluno"
                  disabled={addStudents.isPending}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={addStudents.isPending || !newStudentEmail.trim()}
                >
                  {addStudents.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                Por enquanto, use o ID do aluno. Sistema de convites será
                implementado futuramente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Decks Atribuídos - TODO */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Decks Atribuídos</CardTitle>
          <CardDescription>Vincule decks à turma (assignments)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Funcionalidade de atribuição de decks será implementada na próxima
            etapa (Assignments).
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

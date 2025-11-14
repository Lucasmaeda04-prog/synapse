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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  useClass,
  useUpdateClass,
  useDeleteClass,
  useAddStudents,
  useRemoveStudents,
} from "@/hooks/api/useClasses";
import {
  useAssignDeckToClass,
  useClassAssignments,
  useRemoveAssignment,
} from "@/hooks/api/useAssignments";
import { useDecks } from "@/hooks/api/useDecks";
import {
  AlertCircle,
  BookMarked,
  CalendarClock,
  Link2,
  Loader2,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
} from "lucide-react";

export default function ClassDetail() {
  const { classId: routeClassId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  // Estados para adicionar/remover alunos
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentBeingRemoved, setAssignmentBeingRemoved] = useState<string | null>(null);

  // Buscar turma da API
  const { data: klass, isLoading, isError, error } = useClass(routeClassId || "");
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const addStudents = useAddStudents();
  const removeStudents = useRemoveStudents();
  const {
    data: assignments,
    isLoading: isAssignmentsLoading,
    isError: isAssignmentsError,
    error: assignmentsError,
  } = useClassAssignments(routeClassId || "");
  const assignDeck = useAssignDeckToClass();
  const removeAssignment = useRemoveAssignment();
  const { data: decksData, isLoading: isDecksLoading } = useDecks({
    page: 1,
    limit: 100,
  });

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
  const canEdit = user?.role === "TEACHER"; // Por enquanto, qualquer professor pode editar
  const assignedDecks = assignments || [];
  const availableDecks = decksData?.data || [];
  const currentClassId = klass._id || routeClassId || "";

  const handleEdit = () => {
    setEditName(klass.name);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeClassId) return;

    try {
      await updateClass.mutateAsync({
        id: routeClassId,
        data: { name: editName },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar turma:", error);
    }
  };

  const handleDelete = async () => {
    if (!routeClassId) return;
    try {
      await deleteClass.mutateAsync(routeClassId);
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
    if (!routeClassId || !newStudentEmail.trim()) return;

    try {
      // Por enquanto, vamos simular que o email é o ID do aluno
      // Em produção, você precisaria de um endpoint para buscar aluno por email
      await addStudents.mutateAsync({
        id: routeClassId,
        data: { student_ids: [newStudentEmail.trim()] },
      });
      setNewStudentEmail("");
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!routeClassId) return;

    try {
      await removeStudents.mutateAsync({
        id: routeClassId,
        data: { student_ids: [studentId] },
      });
      setStudentToRemove(null);
    } catch (error) {
      console.error("Erro ao remover aluno:", error);
    }
  };

  const handleAssignDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClassId || !selectedDeckId) return;

    try {
      const dueDateIso = assignmentDueDate
        ? new Date(`${assignmentDueDate}T23:59:59.999`).toISOString()
        : undefined;

      await assignDeck.mutateAsync({
        deck_id: selectedDeckId,
        class_id: currentClassId,
        ...(dueDateIso ? { due_date: dueDateIso } : {}),
      });
      setSelectedDeckId("");
      setAssignmentDueDate("");
      setIsAssignDialogOpen(false);
    } catch (error) {
      console.error("Erro ao atribuir deck:", error);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!currentClassId) return;
    try {
      setAssignmentBeingRemoved(assignmentId);
      await removeAssignment.mutateAsync({
        assignmentId,
        classId: currentClassId,
      });
    } catch (error) {
      console.error("Erro ao remover assignment:", error);
    } finally {
      setAssignmentBeingRemoved(null);
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
                  <CardDescription className="mt-2 text-sm text-muted-foreground">
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

      {/* Card de Decks Atribuídos */}
      <Card className="shadow-card">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <CardTitle>Decks Atribuídos</CardTitle>
              <CardDescription className="text-muted-foreground">
                Gerencie os decks publicados para os alunos desta turma
              </CardDescription>
            </div>
            {canEdit && (
              <Dialog
                open={isAssignDialogOpen}
                onOpenChange={(open) => {
                  setIsAssignDialogOpen(open);
                  if (!open) {
                    setSelectedDeckId("");
                    setAssignmentDueDate("");
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="gradient" size="sm">
                    Atribuir Deck
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Atribuir deck à turma</DialogTitle>
                    <DialogDescription>
                      Escolha um dos seus decks para disponibilizar aos alunos.
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-5" onSubmit={handleAssignDeck}>
                    <div className="space-y-2">
                      <Label>Deck</Label>
                      <Select
                        value={selectedDeckId}
                        onValueChange={setSelectedDeckId}
                        disabled={
                          assignDeck.isPending ||
                          isDecksLoading ||
                          availableDecks.length === 0
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isDecksLoading
                                ? "Carregando decks..."
                                : "Selecione um deck"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDecks.map((deck) => (
                            <SelectItem key={deck._id} value={deck._id}>
                              {deck.title} ({deck.cards_count} cards)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!isDecksLoading && availableDecks.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Você ainda não possui decks cadastrados.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due-date">Data limite (opcional)</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={assignmentDueDate}
                        onChange={(e) => setAssignmentDueDate(e.target.value)}
                        disabled={assignDeck.isPending}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        variant="gradient"
                        disabled={
                          assignDeck.isPending ||
                          !selectedDeckId ||
                          availableDecks.length === 0
                        }
                      >
                        {assignDeck.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Confirmar
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isAssignmentsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((skeleton) => (
                <Skeleton key={skeleton} className="h-24 w-full" />
              ))}
            </div>
          ) : isAssignmentsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {assignmentsError instanceof Error
                  ? assignmentsError.message
                  : "Não foi possível carregar os decks atribuídos."}
              </AlertDescription>
            </Alert>
          ) : assignedDecks.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Nenhum deck foi atribuído a esta turma ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {assignedDecks.map((assignment) => (
                <div
                  key={assignment._id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <BookMarked className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">
                            {assignment.deck?.title || "Deck sem título"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.deck?.description ||
                              "Esse deck não possui descrição."}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {assignment.deck?.tags?.length ? (
                          assignment.deck.tags.map((tag) => (
                            <Badge
                              key={`${assignment._id}-${tag}`}
                              variant="secondary"
                            >
                              #{tag}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">Sem tags</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarClock className="h-4 w-4" />
                          Publicado em{" "}
                          {new Date(assignment.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Link2 className="h-4 w-4" />
                          {assignment.due_date
                            ? `Disponível até ${new Date(
                                assignment.due_date,
                              ).toLocaleDateString("pt-BR")}`
                            : "Sem data limite"}
                        </span>
                        {typeof assignment.deck?.cards_count === "number" && (
                          <span>{assignment.deck.cards_count} cards</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-stretch gap-2 md:items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/decks/${assignment.deck_id}`)}
                      >
                        Ver deck
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveAssignment(assignment._id)}
                          disabled={
                            removeAssignment.isPending &&
                            assignmentBeingRemoved === assignment._id
                          }
                        >
                          {removeAssignment.isPending &&
                          assignmentBeingRemoved === assignment._id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

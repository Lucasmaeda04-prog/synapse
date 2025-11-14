import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Search, Users, Calendar, AlertCircle } from "lucide-react";
import { useClasses } from "@/hooks/api/useClasses";

export default function Classes() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, isError, error } = useClasses({
    query: searchTerm || undefined,
    page: 1,
    limit: 20,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";
  
  // Filtrar classes: professores veem suas turmas, alunos veem turmas onde estão matriculados
  const allClasses = data?.data || [];
  const classes = isTeacher 
    ? allClasses 
    : allClasses.filter(c => c.student_ids?.includes(user?.id || ''));

  // Loading state - renderizado SEM incluir os hooks novamente
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Minhas Turmas</h1>
            <p className="text-muted-foreground">
              {isTeacher
                ? "Gerencie suas turmas e alunos"
                : "Turmas que você participa"}
            </p>
          </div>
          {isTeacher && (
            <Link to="/classes/new">
              <Button variant="gradient" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Nova Turma
              </Button>
            </Link>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Minhas Turmas</h1>
            <p className="text-muted-foreground">
              {isTeacher
                ? "Gerencie suas turmas e alunos"
                : "Turmas que você participa"}
            </p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Erro ao carregar turmas"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Minhas Turmas</h1>
          <p className="text-muted-foreground">
            {isTeacher
              ? "Gerencie suas turmas e alunos"
              : "Turmas que você participa"}
          </p>
        </div>
        {isTeacher && (
          <Link to="/classes/new">
            <Button variant="gradient" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Nova Turma
            </Button>
          </Link>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar turmas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {classes.map((cls) => {
          return (
            <Card
              key={cls._id}
              className="shadow-card hover:shadow-elevated transition-all"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <Users className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">{cls.students_count} alunos</Badge>
                </div>
                <CardTitle className="hover:text-primary transition-colors">
                  {cls.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    Criada em{" "}
                    {new Date(cls.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <Link to={`/classes/${cls._id}`}>
                  <Button variant="outline" className="w-full mt-4">
                    Ver Detalhes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {classes.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Nenhuma turma encontrada
            </h3>
            <p className="text-muted-foreground text-center">
              {searchTerm
                ? "Tente outro termo de busca"
                : isTeacher
                ? "Crie sua primeira turma"
                : "Você ainda não participa de turmas"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

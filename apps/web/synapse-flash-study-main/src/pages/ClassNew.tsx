import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateClass } from "@/hooks/api/useClasses";
import { Loader2 } from "lucide-react";

export default function ClassNew() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const createClass = useCreateClass();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== "teacher") return <Navigate to="/dashboard" />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createClass.mutateAsync({
        name,
        // student_ids, org_id e school_id são opcionais
        // Alunos podem ser adicionados depois na página de detalhes da turma
      });

      // Navegar para a lista de classes após criar
      navigate("/classes");
    } catch (error) {
      // Erro já é tratado pelo hook (mostra toast)
      console.error("Erro ao criar turma:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Nova Turma</CardTitle>
          <CardDescription>
            Crie uma turma e gerencie seus alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Turma *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex.: 9º Ano A"
                disabled={createClass.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Digite um nome descritivo para identificar a turma
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/classes")}
                disabled={createClass.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="gradient"
                type="submit"
                disabled={createClass.isPending || !name.trim()}
              >
                {createClass.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {createClass.isPending ? "Criando..." : "Criar Turma"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

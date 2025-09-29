import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createClass } from '@/lib/mockService';

export default function ClassNew() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'teacher') return <Navigate to="/dashboard" />;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const klass = createClass({ name, description }, user!.id);
    navigate(`/classes/${klass.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Nova Turma</CardTitle>
          <CardDescription>Crie uma turma e gerencie seus alunos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex.: 1º Ano A" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição da turma" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => navigate('/classes')}>Cancelar</Button>
              <Button variant="gradient" type="submit">Criar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


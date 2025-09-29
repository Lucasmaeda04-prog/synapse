import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, Calendar, BookOpen } from 'lucide-react';
import { mockClasses, mockStudents, mockDecks } from '@/lib/mockData';

export default function Classes() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const isTeacher = user?.role === 'teacher';
  const userClasses = isTeacher 
    ? mockClasses.filter(c => c.teacherId === user.id)
    : mockClasses.filter(c => c.studentIds.includes(user?.id || ''));
    
  const filteredClasses = userClasses.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Minhas Turmas</h1>
          <p className="text-muted-foreground">
            {isTeacher ? 'Gerencie suas turmas e alunos' : 'Turmas que você participa'}
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
        {filteredClasses.map((cls) => {
          const students = mockStudents.filter(s => cls.studentIds.includes(s.id));
          const assignedDecks = mockDecks.filter(d => cls.assignedDecks.includes(d.id));

          return (
            <Card key={cls.id} className="shadow-card hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <Badge variant="secondary">{students.length} alunos</Badge>
                </div>
                <CardTitle className="hover:text-primary transition-colors">
                  {cls.name}
                </CardTitle>
                <CardDescription>{cls.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Criada em {cls.createdAt.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {assignedDecks.length} decks atribuídos
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Alunos:</p>
                  <div className="flex flex-wrap gap-2">
                    {students.slice(0, 3).map((student) => (
                      <Badge key={student.id} variant="outline">{student.name}</Badge>
                    ))}
                    {students.length > 3 && (
                      <Badge variant="outline">+{students.length - 3} mais</Badge>
                    )}
                  </div>
                </div>

                <Link to={`/classes/${cls.id}`}>
                  <Button variant="outline" className="w-full">
                    Ver Detalhes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? 'Tente outro termo de busca' : isTeacher ? 'Crie sua primeira turma' : 'Você ainda não participa de turmas'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

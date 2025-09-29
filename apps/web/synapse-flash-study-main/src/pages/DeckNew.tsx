import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createDeck } from '@/lib/mockService';

export default function DeckNew() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'teacher') return <Navigate to="/dashboard" />;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDeck = createDeck({ title, description, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }, user!.id);
    navigate(`/decks/${newDeck.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Novo Deck</CardTitle>
          <CardDescription>Crie um deck de flashcards</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex.: Biologia - Sistema Nervoso" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição do conteúdo" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (separadas por vírgula)</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="biologia, neuro" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => navigate('/decks')}>Cancelar</Button>
              <Button variant="gradient" type="submit">Criar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


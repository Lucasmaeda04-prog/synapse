import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { mockDecks } from '../../data/mock'
import { formatDate } from '../../lib/utils'
import { Plus, Search, BookOpen, Edit, Trash2, Eye } from 'lucide-react'

export function TeacherDecksPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  const filteredDecks = mockDecks.filter(deck => {
    const matchesSearch = deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || deck.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(mockDecks.flatMap(deck => deck.tags)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Decks</h1>
          <p className="text-muted-foreground">
            Gerencie seus decks de flashcards
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Deck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Deck</DialogTitle>
              <DialogDescription>
                Crie um novo deck de flashcards para suas aulas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input placeholder="Nome do deck" />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input placeholder="Descrição do deck" />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
                <Input placeholder="matemática, básico, ensino-médio" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Criar Deck</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar decks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedTag === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag('')}
          >
            Todos
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Decks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDecks.map((deck) => (
          <Card key={deck.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{deck.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {deck.description}
                  </CardDescription>
                </div>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cards:</span>
                  <span className="font-medium">{deck.cardsCount}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Criado:</span>
                  <span>{formatDate(deck.createdAt)}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {deck.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-between pt-2">
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Badge variant={deck.isPublic ? 'default' : 'outline'}>
                    {deck.isPublic ? 'Público' : 'Privado'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDecks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhum deck encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedTag 
              ? 'Tente ajustar os filtros de busca'
              : 'Crie seu primeiro deck para começar'
            }
          </p>
        </div>
      )}
    </div>
  )
}
import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { mockDecks, mockProgress } from '../../data/mock'
import { formatDate } from '../../lib/utils'
import { Search, BookOpen, Play, ChartBar as BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'

export function StudentDecksPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // In a real app, this would be filtered by assignments to the current student
  const assignedDecks = mockDecks
  
  const filteredDecks = assignedDecks.filter(deck =>
    deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProgress = (deckId: string) => {
    return mockProgress.find(p => p.deckId === deckId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meus Decks</h1>
        <p className="text-muted-foreground">
          Decks atribuídos para seu estudo
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar decks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Decks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDecks.map((deck) => {
          const progress = getProgress(deck.id)
          const completionRate = progress 
            ? Math.round((progress.learned / progress.totalCards) * 100)
            : 0

          return (
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <div className="font-medium">{deck.cardsCount} cards</div>
                    </div>
                    {progress && (
                      <div>
                        <span className="text-muted-foreground">Aprendidos:</span>
                        <div className="font-medium">{progress.learned}</div>
                      </div>
                    )}
                  </div>

                  {progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{completionRate}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {progress && progress.dueToday > 0 && (
                    <Badge variant="destructive" className="w-fit">
                      {progress.dueToday} cards para revisar
                    </Badge>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {deck.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/student/progress?deck=${deck.id}`}>
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Progresso
                      </Link>
                    </Button>
                    
                    <Button size="sm" asChild>
                      <Link to={`/student/study/${deck.id}`}>
                        <Play className="h-4 w-4 mr-1" />
                        Estudar
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredDecks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhum deck encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Tente ajustar o termo de busca'
              : 'Você ainda não tem decks atribuídos'
            }
          </p>
        </div>
      )}
    </div>
  )
}
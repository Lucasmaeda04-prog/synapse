import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { mockDecks, mockProgress } from '../../data/mock'
import { formatDate } from '../../lib/utils'
import { TrendingUp, Calendar, Target, Clock } from 'lucide-react'

export function StudentProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Progresso</h1>
        <p className="text-muted-foreground">
          Acompanhe sua evolução nos estudos
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aprendido</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProgress.reduce((sum, p) => sum + p.learned, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              cards dominados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Para Revisar</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProgress.reduce((sum, p) => sum + p.dueToday, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              cards hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decks Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProgress.length}</div>
            <p className="text-xs text-muted-foreground">
              em estudo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atividade</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Hoje</div>
            <p className="text-xs text-muted-foreground">
              última sessão
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress by Deck */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso por Deck</CardTitle>
          <CardDescription>
            Seu desempenho detalhado em cada deck
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockProgress.map((progress) => {
              const deck = mockDecks.find(d => d.id === progress.deckId)
              if (!deck) return null

              const completionRate = Math.round((progress.learned / progress.totalCards) * 100)
              const dueRate = Math.round((progress.dueToday / progress.totalCards) * 100)

              return (
                <div key={progress.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{deck.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Última atividade: {formatDate(progress.lastActivityAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {progress.learned} / {progress.totalCards}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {completionRate}% completo
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progresso geral</span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {deck.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    {progress.dueToday > 0 && (
                      <Badge variant="destructive">
                        {progress.dueToday} para revisar
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
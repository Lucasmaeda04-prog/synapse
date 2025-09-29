import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { mockDecks, mockClasses, mockAssignments } from '../../data/mock'
import { BookOpen, Users, Calendar, TrendingUp } from 'lucide-react'

export function TeacherDashboardPage() {
  const totalDecks = mockDecks.length
  const totalClasses = mockClasses.length
  const totalAssignments = mockAssignments.length
  const totalCards = mockDecks.reduce((sum, deck) => sum + deck.cardsCount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das suas atividades de ensino
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Decks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDecks}</div>
            <p className="text-xs text-muted-foreground">
              {totalCards} cards no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turmas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Turmas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atribuições</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Decks atribuídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de participação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Decks Recentes</CardTitle>
            <CardDescription>
              Seus decks criados recentemente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockDecks.slice(0, 3).map((deck) => (
              <div key={deck.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{deck.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {deck.cardsCount} cards
                  </p>
                </div>
                <div className="flex gap-1">
                  {deck.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Turmas Ativas</CardTitle>
            <CardDescription>
              Suas turmas com maior atividade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockClasses.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{classItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {classItem.studentIds.length} alunos
                  </p>
                </div>
                <Badge variant="outline">Ativa</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
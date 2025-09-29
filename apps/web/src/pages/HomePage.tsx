import { useAuthStore } from '../store/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { BookOpen, Users, TrendingUp, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-6 p-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Synapse</h1>
          <p className="text-xl text-muted-foreground max-w-md">
            Plataforma de aprendizado com repetição espaçada para maximizar sua retenção de conhecimento
          </p>
          <Button asChild size="lg">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </div>
    )
  }

  const getDashboardContent = () => {
    switch (user.role) {
      case 'TEACHER':
        return {
          title: `Bem-vindo, ${user.name}!`,
          description: 'Gerencie seus decks, turmas e acompanhe o progresso dos alunos',
          cards: [
            {
              title: 'Meus Decks',
              description: 'Crie e gerencie seus flashcards',
              icon: BookOpen,
              link: '/teacher/decks',
              color: 'text-blue-600'
            },
            {
              title: 'Turmas',
              description: 'Organize seus alunos em turmas',
              icon: Users,
              link: '/teacher/classes',
              color: 'text-green-600'
            },
            {
              title: 'Dashboard',
              description: 'Visão geral das suas atividades',
              icon: TrendingUp,
              link: '/teacher/dashboard',
              color: 'text-purple-600'
            }
          ]
        }
      
      case 'STUDENT':
        return {
          title: `Olá, ${user.name}!`,
          description: 'Continue seus estudos e acompanhe seu progresso',
          cards: [
            {
              title: 'Meus Decks',
              description: 'Acesse seus decks de estudo',
              icon: BookOpen,
              link: '/student/decks',
              color: 'text-blue-600'
            },
            {
              title: 'Progresso',
              description: 'Acompanhe sua evolução',
              icon: Target,
              link: '/student/progress',
              color: 'text-green-600'
            }
          ]
        }
      
      case 'ADMIN':
        return {
          title: `Painel Administrativo`,
          description: 'Gerencie usuários e monitore a plataforma',
          cards: [
            {
              title: 'Usuários',
              description: 'Gerencie professores e alunos',
              icon: Users,
              link: '/admin/users',
              color: 'text-red-600'
            },
            {
              title: 'Relatórios',
              description: 'Estatísticas da plataforma',
              icon: TrendingUp,
              link: '/admin/reports',
              color: 'text-purple-600'
            }
          ]
        }
      
      default:
        return {
          title: 'Bem-vindo ao Synapse',
          description: 'Sua plataforma de aprendizado',
          cards: []
        }
    }
  }

  const content = getDashboardContent()

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{content.title}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {content.description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
        {content.cards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to={card.link}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Quick Stats or Recent Activity could go here */}
      <div className="text-center pt-8">
        <p className="text-sm text-muted-foreground">
          Synapse - Maximize seu aprendizado com repetição espaçada
        </p>
      </div>
    </div>
  )
}
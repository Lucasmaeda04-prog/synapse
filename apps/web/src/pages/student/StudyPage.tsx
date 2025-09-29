import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { mockDecks, mockCards } from '../../data/mock'
import { RotateCcw, Eye, EyeOff, ArrowLeft } from 'lucide-react'

export function StudyPage() {
  const { deckId } = useParams()
  const navigate = useNavigate()
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studySession, setStudySession] = useState<{
    deck: any
    cards: any[]
    completed: number
  } | null>(null)

  useEffect(() => {
    if (deckId) {
      const deck = mockDecks.find(d => d.id === deckId)
      const cards = mockCards.filter(c => c.deckId === deckId)
      
      if (deck && cards.length > 0) {
        setStudySession({
          deck,
          cards: cards.slice(0, 10), // Simulate a study session with 10 cards
          completed: 0
        })
      }
    }
  }, [deckId])

  if (!studySession) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Deck não encontrado</h2>
        <Button onClick={() => navigate('/student/decks')} className="mt-4">
          Voltar aos Decks
        </Button>
      </div>
    )
  }

  const currentCard = studySession.cards[currentCardIndex]
  const isLastCard = currentCardIndex === studySession.cards.length - 1

  const handleRating = (rating: 0 | 1 | 2 | 3) => {
    // In a real app, this would send the review to the backend
    console.log('Rating:', rating, 'for card:', currentCard.id)
    
    if (isLastCard) {
      // Study session completed
      navigate('/student/decks', { 
        state: { message: 'Sessão de estudo concluída!' }
      })
    } else {
      setCurrentCardIndex(prev => prev + 1)
      setShowAnswer(false)
      setStudySession(prev => prev ? {
        ...prev,
        completed: prev.completed + 1
      } : null)
    }
  }

  const progress = ((currentCardIndex + (showAnswer ? 0.5 : 0)) / studySession.cards.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/student/decks')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="text-center">
          <h1 className="text-xl font-semibold">{studySession.deck.title}</h1>
          <p className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} de {studySession.cards.length}
          </p>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Study Card */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {showAnswer ? 'Resposta' : 'Pergunta'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <p className="text-lg leading-relaxed">
              {showAnswer ? currentCard.back : currentCard.front}
            </p>
          </div>

          {showAnswer && currentCard.hints.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Dicas:</h4>
              <ul className="space-y-1">
                {currentCard.hints.map((hint: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!showAnswer ? (
            <div className="text-center">
              <Button onClick={() => setShowAnswer(true)}>
                Mostrar Resposta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Como foi sua resposta?
              </p>
              
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <Button
                  variant="destructive"
                  onClick={() => handleRating(0)}
                  className="flex flex-col h-auto py-3"
                >
                  <span className="font-semibold">Novamente</span>
                  <span className="text-xs opacity-80">Errei</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleRating(1)}
                  className="flex flex-col h-auto py-3 border-orange-200 hover:bg-orange-50"
                >
                  <span className="font-semibold">Difícil</span>
                  <span className="text-xs opacity-80">Com dificuldade</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleRating(2)}
                  className="flex flex-col h-auto py-3 border-blue-200 hover:bg-blue-50"
                >
                  <span className="font-semibold">Bom</span>
                  <span className="text-xs opacity-80">Acertei</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleRating(3)}
                  className="flex flex-col h-auto py-3 border-green-200 hover:bg-green-50"
                >
                  <span className="font-semibold">Fácil</span>
                  <span className="text-xs opacity-80">Muito fácil</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Tips */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <RotateCcw className="h-4 w-4" />
            <span>
              Use as avaliações para otimizar seu aprendizado. Cards difíceis aparecerão mais frequentemente.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
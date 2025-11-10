import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  const { login, register, resetPassword, isAuthenticated, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (firebaseUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [firebaseUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      // Navegar imediatamente - o ProtectedRoute vai verificar firebaseUser
      navigate('/dashboard');
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message || 'Credenciais inválidas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await register(email, password, name, role);
      navigate('/dashboard');
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Bem-vindo ao Synapse!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message || 'Não foi possível criar a conta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, digite um email válido',
        variant: 'destructive',
      });
      return;
    }
    
    setIsResetting(true);
    
    try {
      console.log('🔄 Iniciando processo de reset de senha para:', resetEmail);
      await resetPassword(resetEmail);
      console.log('✅ Reset de senha processado com sucesso');
      
      setIsResetDialogOpen(false);
      setResetEmail('');
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada (e spam) para redefinir sua senha.',
      });
    } catch (error: any) {
      console.error('❌ Erro no handleResetPassword:', error);
      toast({
        title: 'Erro ao enviar email',
        description: error.message || 'Não foi possível enviar o email de recuperação',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Synapse</CardTitle>
          <CardDescription>Entre na plataforma de aprendizado</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Registrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
              <Input
                    id="login-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
              <Input
                    id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setIsResetDialogOpen(true);
                }}
                className="text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
                <Button type="submit" className="w-full" variant="gradient" disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-role">Tipo de usuário</Label>
                  <Select value={role} onValueChange={(value: 'TEACHER' | 'STUDENT') => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEACHER">Professor</SelectItem>
                      <SelectItem value="STUDENT">Aluno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" variant="gradient" disabled={isLoading}>
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Contas de teste:</p>
            <p>Professor: professor@synapse.com</p>
            <p>Aluno: aluno@synapse.com</p>
            <p className="text-xs">(qualquer senha funciona)</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir senha</DialogTitle>
            <DialogDescription>
              Digite seu email e enviaremos um link para redefinir sua senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsResetDialogOpen(false);
                  setResetEmail('');
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? 'Enviando...' : 'Enviar email'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

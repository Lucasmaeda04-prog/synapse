import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);

      // Adicionar informações do usuário ao request
      request.user = {
        ...decodedToken,
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name || decodedToken.email?.split('@')[0] || '',
        role: (decodedToken.role as string) || 'STUDENT', // Default role
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}

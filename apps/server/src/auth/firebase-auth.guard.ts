import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private firebaseService: FirebaseService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);

      // Buscar usuário no MongoDB para obter o _id e role
      const dbUser = await this.userModel.findOne({ uid: decodedToken.uid }).exec();
      
      if (!dbUser) {
        throw new UnauthorizedException('Usuário não encontrado no banco de dados');
      }
      
      // Adicionar informações do usuário ao request
      // IMPORTANTE: role e userId devem vir do MongoDB, não do token Firebase
      request.user = {
        ...decodedToken,
        uid: decodedToken.uid,
        userId: dbUser._id.toString(), // MongoDB _id como string (obrigatório)
        email: dbUser.email || decodedToken.email || '',
        name: dbUser.name || decodedToken.name || decodedToken.email?.split('@')[0] || '',
        role: dbUser.role, // Role do MongoDB (obrigatório)
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}

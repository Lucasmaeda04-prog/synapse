import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (!admin.apps.length) {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const privateKey = this.configService
        .get<string>('FIREBASE_PRIVATE_KEY')
        ?.replace(/\\n/g, '\n');
      const clientEmail = this.configService.get<string>(
        'FIREBASE_CLIENT_EMAIL',
      );

      // Se as variáveis não estiverem configuradas, não inicializa
      if (!projectId || !privateKey || !clientEmail) {
        console.warn(
          '⚠️  Firebase Admin não configurado. Variáveis de ambiente faltando.',
        );
        console.warn(
          '   Configure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY e FIREBASE_CLIENT_EMAIL no .env',
        );
        return;
      }

      const serviceAccount = {
        projectId,
        privateKey,
        clientEmail,
      };

      try {
        this.app = admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
        });
        console.log('✅ Firebase Admin inicializado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao inicializar Firebase Admin:', error);
      }
    } else {
      this.app = admin.app();
    }
  }

  private ensureInitialized() {
    if (!this.app && admin.apps.length > 0) {
      this.app = admin.app();
    }
    if (!this.app) {
      throw new Error(
        'Firebase Admin não foi inicializado. Verifique as variáveis de ambiente.',
      );
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    this.ensureInitialized();
    try {
      return await this.app.auth().verifyIdToken(idToken);
    } catch {
      throw new Error('Token inválido');
    }
  }

  async getUser(uid: string): Promise<admin.auth.UserRecord> {
    this.ensureInitialized();
    try {
      return await this.app.auth().getUser(uid);
    } catch {
      throw new Error('Usuário não encontrado');
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    displayName?: string;
    customClaims?: Record<string, any>;
  }): Promise<admin.auth.UserRecord> {
    this.ensureInitialized();
    try {
      return await this.app.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      });
    } catch {
      throw new Error('Erro ao criar usuário');
    }
  }

  async setCustomUserClaims(
    uid: string,
    customClaims: Record<string, any>,
  ): Promise<void> {
    this.ensureInitialized();
    try {
      await this.app.auth().setCustomUserClaims(uid, customClaims);
    } catch {
      throw new Error('Erro ao definir claims do usuário');
    }
  }
}

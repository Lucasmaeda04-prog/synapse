import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

interface User {
  _id: string;
  uid: string;
  email: string;
  name: string;
  role: string;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo usuário (sincronização Firebase → MongoDB)',
    description:
      'Endpoint público para criar usuário após registro no Firebase. Não requer autenticação.',
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Usuário já existe' })
  async createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    console.log('📥 Recebendo requisição para criar usuário:', {
      uid: createUserDto.uid,
      email: createUserDto.email,
      name: createUserDto.name,
      role: createUserDto.role,
    });

    try {
      // Verificar se o usuário já existe
      const existingUser = await this.usersService.findUserByUid(
        createUserDto.uid,
      );
      if (existingUser) {
        console.log('ℹ️ Usuário já existe, retornando existente');
        return existingUser; // Retornar usuário existente ao invés de erro
      }

      const newUser = await this.usersService.createUser(createUserDto);
      console.log('✅ Usuário criado com sucesso no MongoDB:', newUser.id);
      return newUser;
    } catch (error: any) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário atual' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getCurrentUser(@CurrentUser() user: User) {
    const dbUser = await this.usersService.findUserByUid(user.uid);
    if (!dbUser) {
      console.log(
        '⚠️ Usuário não encontrado no MongoDB, criando com role STUDENT:',
        {
          uid: user.uid,
          email: user.email,
        },
      );
      return this.usersService.createUser({
        uid: user.uid,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: 'STUDENT',
      });
    }
    console.log('✅ Usuário encontrado no MongoDB:', {
      uid: dbUser.uid,
      email: dbUser.email,
      role: dbUser.role,
    });
    return dbUser;
  }

  @Patch(':uid/role')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar role do usuário (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Role atualizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async updateUserRole(
    @Param('uid') uid: string,
    @Body() body: { role: 'ADMIN' | 'TEACHER' | 'STUDENT' },
  ) {
    return this.usersService.updateUserRole(uid, body.role);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os usuários (apenas ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}

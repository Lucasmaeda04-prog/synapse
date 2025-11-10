import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import type { CreateUserDto } from './users.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

interface User {
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
    description: 'Endpoint público para criar usuário após registro no Firebase. Não requer autenticação.',
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Usuário já existe' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    // Verificar se o usuário já existe
    const existingUser = await this.usersService.findUserByUid(createUserDto.uid);
    if (existingUser) {
      return existingUser; // Retornar usuário existente ao invés de erro
    }
    
    return this.usersService.createUser(createUserDto);
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
      // Se não existe no MongoDB, criar automaticamente
      return this.usersService.createUser({
        uid: user.uid,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: (user.role as 'ADMIN' | 'TEACHER' | 'STUDENT') || 'STUDENT',
      });
    }
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

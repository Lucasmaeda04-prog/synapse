import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { CurrentUser } from './current-user.decorator';

interface User {
  uid: string;
  email: string;
  name: string;
  role: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário atual' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.uid,
      email: user.email,
      name: user.name,
      role: user.role, // Este role vem do FirebaseAuthGuard, pode estar incorreto
    };
  }

  @Get('teacher-only')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint apenas para professores' })
  @ApiResponse({ status: 200, description: 'Acesso permitido' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  teacherOnly(@CurrentUser() user: User) {
    return {
      message: 'Acesso permitido para professores',
      user: user.email,
    };
  }

  @Get('admin-only')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint apenas para administradores' })
  @ApiResponse({ status: 200, description: 'Acesso permitido' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  adminOnly(@CurrentUser() user: User) {
    return {
      message: 'Acesso permitido para administradores',
      user: user.email,
    };
  }
}

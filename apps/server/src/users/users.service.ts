import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';

export interface CreateUserDto {
  uid: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se já existe por UID
    const existingByUid = await this.findUserByUid(createUserDto.uid);
    if (existingByUid) {
      return existingByUid;
    }

    // Verificar se já existe por email
    const existingByEmail = await this.findUserByEmail(createUserDto.email);
    if (existingByEmail) {
      return existingByEmail;
    }

    const user = new this.userModel({
      ...createUserDto,
      password_hash: '', // Firebase gerencia a senha
    });

    try {
      return await user.save();
    } catch (error: any) {
      // Se for erro de duplicata, tentar buscar o usuário existente
      if (error.code === 11000) {
        const existingUser = await this.findUserByUid(createUserDto.uid) || 
                           await this.findUserByEmail(createUserDto.email);
        if (existingUser) {
          return existingUser;
        }
      }
      throw error;
    }
  }

  async findUserByUid(uid: string): Promise<User | null> {
    return this.userModel.findOne({ uid }).exec();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateUserRole(
    uid: string,
    role: 'ADMIN' | 'TEACHER' | 'STUDENT',
  ): Promise<User | null> {
    // Atualizar no MongoDB
    const user = await this.userModel
      .findOneAndUpdate({ uid }, { role }, { new: true })
      .exec();

    // Atualizar custom claims no Firebase (se necessário)
    // Isso pode ser feito via endpoint separado ou Cloud Function

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async deleteUser(uid: string): Promise<void> {
    await this.userModel.findOneAndDelete({ uid }).exec();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  state() {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    return this.connection.readyState;
  }

  async ping() {
    try {
      if (this.connection.readyState !== 1) return false;
      // Ensure db exists
      await this.connection.db!.admin().ping();
      return true;
    } catch {
      return false;
    }
  }
}

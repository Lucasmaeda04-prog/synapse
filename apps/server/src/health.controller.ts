import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async health() {
    const dbOk = await this.healthService.ping();
    return {
      status: 'ok',
      db: dbOk ? 'up' : 'down',
      dbState: this.healthService.state(),
      timestamp: new Date().toISOString(),
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar status de saúde da API' })
  @ApiResponse({
    status: 200,
    description: 'Status da aplicação e banco de dados',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        db: { type: 'string', example: 'up' },
        dbState: { type: 'string', example: 'connected' },
        timestamp: { type: 'string', example: '2025-01-27T10:30:00.000Z' },
      },
    },
  })
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

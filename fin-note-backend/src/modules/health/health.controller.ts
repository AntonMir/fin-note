import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthStatusType } from '@modules/health/health.type';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiOperation({ summary: 'Health Check' })
  @ApiResponse({ status: 200, example: { success: true } })
  @Get()
  health(): HealthStatusType {
    return this.healthService.getHealthStatus();
  }
}

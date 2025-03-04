import { Injectable } from '@nestjs/common';
import { HealthStatusType } from '@modules/health/health.type';

@Injectable()
export class HealthService {
  getHealthStatus(): HealthStatusType {
    return {
      success: true,
    };
  }
}

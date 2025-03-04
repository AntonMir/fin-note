import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from '@modules/health/health.service';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    healthController = module.get<HealthController>(HealthController);
  });

  describe('health', () => {
    it('should return success response', () => {
      expect(healthController.health()).toEqual({ success: true });
    });
  });
});

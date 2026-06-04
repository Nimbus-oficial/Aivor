import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { VaultModule } from "../vault/vault.module";
import { HealthService } from "./health.service";
import { ObservabilityController } from "./observability.controller";

@Module({
  imports: [DatabaseModule, VaultModule],
  controllers: [ObservabilityController],
  providers: [HealthService]
})
export class ObservabilityModule {}

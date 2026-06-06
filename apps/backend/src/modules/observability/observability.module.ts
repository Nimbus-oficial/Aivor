import { Module } from "@nestjs/common";
import { AllocatorModule } from "../allocator/allocator.module";
import { DatabaseModule } from "../database/database.module";
import { GovernanceModule } from "../governance/governance.module";
import { MorphoModule } from "../morpho/morpho.module";
import { VaultModule } from "../vault/vault.module";
import { HealthService } from "./health.service";
import { ObservabilityController } from "./observability.controller";

@Module({
  imports: [DatabaseModule, VaultModule, GovernanceModule, MorphoModule, AllocatorModule],
  controllers: [ObservabilityController],
  providers: [HealthService]
})
export class ObservabilityModule {}

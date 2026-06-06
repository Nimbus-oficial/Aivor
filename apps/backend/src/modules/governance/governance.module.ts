import { Module } from "@nestjs/common";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { GovernanceController } from "./governance.controller";
import { GovernanceService } from "./governance.service";
import { SafeReadonlyService } from "./safe-readonly.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [GovernanceController],
  providers: [GovernanceService, SafeReadonlyService, StructuredLogger],
  exports: [GovernanceService, SafeReadonlyService]
})
export class GovernanceModule {}

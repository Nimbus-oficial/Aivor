import { Module } from "@nestjs/common";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { DatabaseModule } from "../database/database.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrivyAuthService } from "./privy-auth.service";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, PrivyAuthService, RolesGuard, StructuredLogger],
  exports: [AuthService, RolesGuard]
})
export class AuthModule {}

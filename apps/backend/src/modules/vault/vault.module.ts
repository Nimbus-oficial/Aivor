import { Module } from "@nestjs/common";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { DatabaseModule } from "../database/database.module";
import { VaultChainService } from "./vault-chain.service";
import { VaultController } from "./vault.controller";
import { VaultService } from "./vault.service";

@Module({
  imports: [DatabaseModule],
  controllers: [VaultController],
  providers: [StructuredLogger, VaultChainService, VaultService],
  exports: [VaultChainService, VaultService]
})
export class VaultModule {}

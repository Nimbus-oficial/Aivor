import { Module } from "@nestjs/common";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { DatabaseModule } from "../database/database.module";
import { AllocatorChainService } from "./allocator-chain.service";
import { AllocatorController } from "./allocator.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [AllocatorController],
  providers: [AllocatorChainService, StructuredLogger],
  exports: [AllocatorChainService]
})
export class AllocatorModule {}

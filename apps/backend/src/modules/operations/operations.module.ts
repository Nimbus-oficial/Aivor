import { Module } from "@nestjs/common";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { DatabaseModule } from "../database/database.module";
import { OperationsController } from "./operations.controller";
import { OperationsService } from "./operations.service";

@Module({
  imports: [DatabaseModule],
  controllers: [OperationsController],
  providers: [OperationsService, StructuredLogger],
  exports: [OperationsService]
})
export class OperationsModule {}

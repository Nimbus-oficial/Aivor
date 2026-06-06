import { Module } from "@nestjs/common";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { MorphoController } from "./morpho.controller";
import { MorphoService } from "./morpho.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [MorphoController],
  providers: [MorphoService, StructuredLogger],
  exports: [MorphoService]
})
export class MorphoModule {}

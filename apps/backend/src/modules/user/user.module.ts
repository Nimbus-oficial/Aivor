import { Module } from "@nestjs/common";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { DatabaseModule } from "../database/database.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, StructuredLogger],
  exports: [UserService]
})
export class UserModule {}

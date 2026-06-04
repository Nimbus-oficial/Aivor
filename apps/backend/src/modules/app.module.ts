import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StructuredLogger } from "../common/logging/structured-logger.service";
import { AiModule } from "./ai/ai.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { NotificationModule } from "./notification/notification.module";
import { ObservabilityModule } from "./observability/observability.module";
import { OperationsModule } from "./operations/operations.module";
import { SecurityModule } from "./security/security.module";
import { UserModule } from "./user/user.module";
import { VaultModule } from "./vault/vault.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UserModule,
    VaultModule,
    AnalyticsModule,
    NotificationModule,
    AiModule,
    SecurityModule,
    ObservabilityModule,
    OperationsModule
  ],
  providers: [StructuredLogger]
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { AdminRecordRepository } from "./repositories/admin-record.repository";
import { AuditRepository } from "./repositories/audit.repository";
import { EventRepository } from "./repositories/event.repository";
import { OperationalSettingsRepository } from "./repositories/operational-settings.repository";
import { PositionSnapshotRepository } from "./repositories/position-snapshot.repository";
import { SessionRepository } from "./repositories/session.repository";
import { UserRepository } from "./repositories/user.repository";
import { AuditLogService } from "./services/audit-log.service";
import { OperationalSettingsService } from "./services/operational-settings.service";

@Module({
  providers: [
    DatabaseService,
    UserRepository,
    AuditRepository,
    EventRepository,
    AdminRecordRepository,
    OperationalSettingsRepository,
    PositionSnapshotRepository,
    SessionRepository,
    AuditLogService,
    OperationalSettingsService
  ],
  exports: [
    DatabaseService,
    UserRepository,
    AuditRepository,
    EventRepository,
    AdminRecordRepository,
    OperationalSettingsRepository,
    PositionSnapshotRepository,
    SessionRepository,
    AuditLogService,
    OperationalSettingsService
  ]
})
export class DatabaseModule {}

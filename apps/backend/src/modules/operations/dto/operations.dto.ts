import type {
  AuditLogInput,
  EventInput,
  OperationalSettingInput,
  PositionSnapshotInput
} from "../../database/types/database.types";
import type { AdminRecordInput } from "../../database/repositories/admin-record.repository";

export type CreateEventDto = EventInput;
export type CreateAuditLogDto = AuditLogInput;
export type UpsertOperationalSettingDto = OperationalSettingInput;
export type CreateAdminRecordDto = AdminRecordInput;
export type CreatePositionSnapshotDto = PositionSnapshotInput;

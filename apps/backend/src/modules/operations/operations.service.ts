import { Injectable } from "@nestjs/common";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { DatabaseValidationError } from "../database/database.errors";
import { AdminRecordRepository } from "../database/repositories/admin-record.repository";
import { PositionSnapshotRepository } from "../database/repositories/position-snapshot.repository";
import { AuditLogService } from "../database/services/audit-log.service";
import { OperationalSettingsService } from "../database/services/operational-settings.service";
import { OperationalSettingsRepository } from "../database/repositories/operational-settings.repository";
import type {
  CreateAdminRecordDto,
  CreateAuditLogDto,
  CreateEventDto,
  CreatePositionSnapshotDto,
  UpsertOperationalSettingDto
} from "./dto/operations.dto";

@Injectable()
export class OperationsService {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly settingsService: OperationalSettingsService,
    private readonly settingsRepository: OperationalSettingsRepository,
    private readonly adminRecordRepository: AdminRecordRepository,
    private readonly positionSnapshotRepository: PositionSnapshotRepository,
    private readonly logger: StructuredLogger
  ) {}

  getOfficialPolicy() {
    return {
      liquidity: {
        minBps: 200,
        targetBps: 500,
        maxBps: 700
      },
      governance: {
        multisig: "Safe 2-of-4",
        timelockRequired: true,
        emergencyPauseAllowed: true
      },
      supportedAssets: ["USDC", "EURC"],
      enabledProtocols: ["Morpho"],
      shareToken: {
        name: "Orvex Yield USDC",
        ticker: "ovUSDC",
        model: "ERC4626 yield-bearing share",
        rebasing: false
      },
      custody: {
        backendCustodiesFunds: false,
        databaseIsFinalFinancialSource: false,
        finalFinancialSource: "blockchain"
      }
    };
  }

  async readLiquidityPolicy() {
    return this.settingsService.getLiquidityPolicy();
  }

  async upsertOperationalSetting(input: UpsertOperationalSettingDto) {
    const setting = await this.settingsRepository.upsert(input);
    await this.auditLogService.recordAuditAction({
      actorUserId: input.updatedBy ?? null,
      action: "operational_setting.upserted",
      origin: "backend-api",
      targetType: "operational_settings",
      targetId: input.key,
      result: "success",
      metadata: {
        key: input.key,
        isSensitive: input.isSensitive ?? false
      }
    });
    return setting;
  }

  async createEvent(input: CreateEventDto) {
    const event = await this.auditLogService.recordEvent(input);
    this.logger.info({
      event: input.eventType,
      source: input.source,
      result: input.result,
      metadata: input.metadata
    });
    return event;
  }

  async createAuditLog(input: CreateAuditLogDto) {
    return this.auditLogService.recordAuditAction(input);
  }

  async createAdminRecord(input: CreateAdminRecordDto) {
    const record = await this.adminRecordRepository.create(input);
    if (!record) throw new DatabaseValidationError("admin record was not persisted");
    await this.auditLogService.recordAuditAction({
      actorUserId: input.requestedBy ?? null,
      action: "admin_record.created",
      origin: "backend-api",
      targetType: "admin_records",
      targetId: record.id,
      result: "success",
      metadata: {
        action: input.action,
        status: input.status
      }
    });
    return record;
  }

  async createPositionSnapshot(input: CreatePositionSnapshotDto) {
    const snapshot = await this.positionSnapshotRepository.create(input);
    await this.auditLogService.recordEvent({
      eventType: "position_snapshot.created",
      category: "blockchain",
      source: "backend-api",
      actorUserId: input.userId ?? null,
      walletAddress: input.walletAddress ?? null,
      chainId: input.chainId,
      result: "success",
      metadata: {
        assetSymbol: input.assetSymbol,
        source: input.source,
        note: "operational_reading_not_final_financial_source"
      }
    });
    return {
      ...snapshot,
      custodyNotice:
        "position_snapshot is an operational reading; blockchain remains the final source of financial truth."
    };
  }
}

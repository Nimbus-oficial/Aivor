import { Body, Controller, Get, Post } from "@nestjs/common";
import { ok } from "../../common/responses/api-response";
import type {
  CreateAdminRecordDto,
  CreateAuditLogDto,
  CreateEventDto,
  CreatePositionSnapshotDto,
  UpsertOperationalSettingDto
} from "./dto/operations.dto";
import { OperationsService } from "./operations.service";

@Controller("operations")
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get("policy")
  getOfficialPolicy() {
    return ok(this.operationsService.getOfficialPolicy(), "system");
  }

  @Get("settings/liquidity-policy")
  async getLiquidityPolicy() {
    const policy = await this.operationsService.readLiquidityPolicy();
    return ok(policy ?? this.operationsService.getOfficialPolicy().liquidity, policy ? "database" : "system");
  }

  @Post("settings")
  async upsertSetting(@Body() body: UpsertOperationalSettingDto) {
    const setting = await this.operationsService.upsertOperationalSetting(body);
    return ok(setting, "database");
  }

  @Post("events")
  async createEvent(@Body() body: CreateEventDto) {
    const event = await this.operationsService.createEvent(body);
    return ok(event, "database");
  }

  @Post("audit-logs")
  async createAuditLog(@Body() body: CreateAuditLogDto) {
    const auditLog = await this.operationsService.createAuditLog(body);
    return ok(auditLog, "database");
  }

  @Post("admin-records")
  async createAdminRecord(@Body() body: CreateAdminRecordDto) {
    const record = await this.operationsService.createAdminRecord(body);
    return ok(record, "database");
  }

  @Post("position-snapshots")
  async createPositionSnapshot(@Body() body: CreatePositionSnapshotDto) {
    const snapshot = await this.operationsService.createPositionSnapshot(body);
    return ok(snapshot, "database");
  }
}

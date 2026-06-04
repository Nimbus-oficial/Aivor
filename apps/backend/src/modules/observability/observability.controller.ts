import { Controller, Get } from "@nestjs/common";
import { ok } from "../../common/responses/api-response";
import { HealthService } from "./health.service";

@Controller("health")
export class ObservabilityController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async health() {
    return ok(await this.healthService.getFullHealth(), "system");
  }

  @Get("backend")
  backend() {
    return ok(this.healthService.getBackendHealth(), "system");
  }

  @Get("database")
  async database() {
    return ok(await this.healthService.getDatabaseHealth(), "system");
  }

  @Get("rpc")
  async rpc() {
    return ok(await this.healthService.getRpcHealth(), "system");
  }
}

import { Controller, Get } from "@nestjs/common";
import { ok } from "../../common/responses/api-response";
import { MorphoService } from "../morpho/morpho.service";
import { HealthService } from "./health.service";

@Controller("health")
export class ObservabilityController {
  constructor(
    private readonly healthService: HealthService,
    private readonly morphoService: MorphoService
  ) {}

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

  @Get("governance")
  async governance() {
    return ok(await this.healthService.getGovernanceHealth(), "system");
  }

  @Get("morpho")
  async morpho() {
    return ok(await this.morphoService.getHealth(), "system");
  }

  @Get("allocator")
  async allocator() {
    return ok(await this.healthService.getAllocatorHealth(), "system");
  }
}

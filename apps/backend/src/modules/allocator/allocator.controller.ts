import { Controller, Get } from "@nestjs/common";
import { ok } from "../../common/responses/api-response";
import { AllocatorChainService } from "./allocator-chain.service";

@Controller("allocator")
export class AllocatorController {
  constructor(private readonly allocatorChainService: AllocatorChainService) {}

  @Get("status")
  async status() {
    return ok(await this.allocatorChainService.getStatus(), "onchain");
  }

  @Get("exposure")
  async exposure() {
    return ok(await this.allocatorChainService.getExposure(), "onchain");
  }

  @Get("health")
  async health() {
    return ok(await this.allocatorChainService.getHealth(), "onchain");
  }

  @Get("readiness")
  async readiness() {
    return ok(await this.allocatorChainService.getReadiness(), "system");
  }
}

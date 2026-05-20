import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class ObservabilityController {
  @Get()
  health() {
    return {
      status: "ok",
      service: "orvex-backend"
    };
  }
}

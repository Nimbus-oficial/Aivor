import { Body, Controller, Get, Post } from "@nestjs/common";
import { ok } from "../../common/responses/api-response";
import { AuthService } from "./auth.service";
import type { CreateSessionDto, RevokeSessionDto } from "./dto/session.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("providers")
  getSupportedProviders() {
    return ok({ providers: this.authService.getSupportedProviders() }, "system");
  }

  @Post("sessions")
  async createSession(@Body() body: CreateSessionDto) {
    const session = await this.authService.createSession(body);
    return ok(session, "database");
  }

  @Post("sessions/revoke")
  async revokeSession(@Body() body: RevokeSessionDto) {
    const session = await this.authService.revokeSession(body);
    return ok({ revoked: Boolean(session), session }, "database");
  }
}

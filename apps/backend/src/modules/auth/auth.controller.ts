import { Body, Controller, Get, Headers, Post, Req } from "@nestjs/common";
import { ok } from "../../common/responses/api-response";
import { AuthService } from "./auth.service";
import type { CreateSessionDto, PrivyLoginDto, PrivyLogoutDto, RevokeSessionDto } from "./dto/session.dto";
import { extractBearerToken } from "./session-token";

interface RequestLike {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
  socket?: {
    remoteAddress?: string;
  };
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("providers")
  getSupportedProviders() {
    return ok({ providers: this.authService.getSupportedProviders() }, "system");
  }

  @Post("login")
  async login(@Body() body: PrivyLoginDto, @Req() request: RequestLike) {
    const session = await this.authService.loginWithPrivy(body, this.getRequestContext(request));
    return ok(session, "database");
  }

  @Post("logout")
  async logout(
    @Body() body: Partial<PrivyLogoutDto> | undefined,
    @Headers("authorization") authorizationHeader: string | undefined,
    @Req() request: RequestLike
  ) {
    const sessionToken = body?.sessionToken ?? extractBearerToken(authorizationHeader);
    const result = await this.authService.logout({ sessionToken: sessionToken ?? "" }, this.getRequestContext(request));
    return ok(result, "database");
  }

  @Get("session")
  async getCurrentSession(@Headers("authorization") authorizationHeader: string | undefined) {
    const sessionToken = extractBearerToken(authorizationHeader);
    const session = await this.authService.validateSessionToken(sessionToken ?? "");
    return ok(session, "database");
  }

  @Get("me")
  async getAuthenticatedProfile(@Headers("authorization") authorizationHeader: string | undefined) {
    const sessionToken = extractBearerToken(authorizationHeader);
    const session = await this.authService.validateSessionToken(sessionToken ?? "");
    return ok(
      {
        user: session.user,
        wallets: session.wallets,
        custody: {
          backendCustody: false,
          privateKeysStored: false,
          financialSourceOfTruth: "blockchain"
        }
      },
      "database"
    );
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

  private getRequestContext(request: RequestLike) {
    const forwardedFor = request.headers?.["x-forwarded-for"];
    const ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;

    return {
      ipAddress: ipAddress ?? request.ip ?? request.socket?.remoteAddress ?? null,
      userAgent: this.getHeaderValue(request.headers?.["user-agent"])
    };
  }

  private getHeaderValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value ?? null;
  }
}

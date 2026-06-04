import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { AuditLogService } from "../database/services/audit-log.service";
import type { UserRole } from "../database/types/database.types";
import { AuthService } from "./auth.service";
import { extractBearerToken } from "./session-token";

export const ROLES_KEY = "aivor:roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
    private readonly logger: StructuredLogger
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!roles?.length) return true;

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string | string[] };
      method?: string;
      url?: string;
      user?: unknown;
    }>();
    const token = extractBearerToken(request.headers.authorization);
    if (!token) {
      await this.recordBlockedAttempt(null, roles, request, "missing_session_token");
      throw new UnauthorizedException("Missing session token");
    }

    let session;
    try {
      session = await this.authService.validateSessionToken(token);
    } catch (error) {
      await this.recordBlockedAttempt(null, roles, request, "invalid_or_expired_session");
      throw error;
    }
    request.user = session;

    if (!roles.includes(session.user.role)) {
      await this.recordBlockedAttempt(session.user.id, roles, request, "insufficient_role");
      throw new ForbiddenException("Insufficient role");
    }

    return true;
  }

  private async recordBlockedAttempt(
    actorUserId: string | null,
    requiredRoles: UserRole[],
    request: { method?: string; url?: string },
    reason: string
  ) {
    await this.auditLogService.recordAuditAction({
      actorUserId,
      action: "auth.permission.denied",
      origin: "backend-api",
      targetType: "route",
      targetId: `${request.method ?? "UNKNOWN"} ${request.url ?? "unknown"}`,
      result: "failure",
      metadata: {
        reason,
        requiredRoles
      }
    });

    this.logger.warn({
      event: "auth.permission.denied",
      source: "backend-api",
      result: "failure",
      metadata: {
        actorUserId,
        reason,
        requiredRoles,
        route: `${request.method ?? "UNKNOWN"} ${request.url ?? "unknown"}`
      }
    });
  }
}

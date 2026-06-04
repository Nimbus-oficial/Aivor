import { Injectable } from "@nestjs/common";
import { DatabaseValidationError } from "../database/database.errors";
import { SessionRepository } from "../database/repositories/session.repository";
import { AuditLogService } from "../database/services/audit-log.service";
import type { CreateSessionDto, RevokeSessionDto } from "./dto/session.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  getSupportedProviders() {
    return ["google", "apple", "email"] as const;
  }

  async createSession(input: CreateSessionDto) {
    const expiresAt = new Date(input.expiresAt);
    if (Number.isNaN(expiresAt.getTime())) {
      throw new DatabaseValidationError("expiresAt must be a valid ISO date");
    }

    const session = await this.sessionRepository.create({
      userId: input.userId ?? null,
      sessionHash: input.sessionHash,
      provider: input.provider ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      expiresAt
    });

    await this.auditLogService.recordEvent({
      eventType: "session.created",
      category: "security",
      source: "backend-api",
      actorUserId: input.userId ?? null,
      result: "success",
      metadata: {
        provider: input.provider ?? null
      }
    });

    return session;
  }

  async revokeSession(input: RevokeSessionDto) {
    const session = await this.sessionRepository.revoke(input.sessionHash);

    await this.auditLogService.recordEvent({
      eventType: "session.revoked",
      category: "security",
      source: "backend-api",
      result: session ? "success" : "failure",
      metadata: {
        found: Boolean(session)
      }
    });

    return session;
  }
}

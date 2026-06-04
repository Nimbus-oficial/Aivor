import { Injectable, UnauthorizedException } from "@nestjs/common";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { DatabaseValidationError } from "../database/database.errors";
import { SessionRepository } from "../database/repositories/session.repository";
import { UserRepository } from "../database/repositories/user.repository";
import { AuditLogService } from "../database/services/audit-log.service";
import type { UserRole } from "../database/types/database.types";
import type { CreateSessionDto, PrivyLoginDto, PrivyLogoutDto, RevokeSessionDto } from "./dto/session.dto";
import { PrivyAuthService } from "./privy-auth.service";
import { createSessionToken, hashSessionToken } from "./session-token";

interface LoginWallet {
  address: string;
  chainId: number;
  label?: string | null;
}

export interface AuthRequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuthenticatedSession {
  session: {
    id: string;
    expiresAt: Date;
    provider: string | null;
  };
  user: {
    id: string;
    externalAuthSubject: string | null;
    displayName: string | null;
    email: string | null;
    role: UserRole;
    status: string;
  };
  wallets: Array<{
    id: string;
    address: string;
    chainId: number;
    label: string | null;
    isPrimary: boolean;
    verifiedAt: Date | null;
  }>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly privyAuthService: PrivyAuthService,
    private readonly structuredLogger: StructuredLogger,
    private readonly auditLogService: AuditLogService
  ) {}

  getSupportedProviders() {
    return ["privy", "wallet", "email", "google", "apple"] as const;
  }

  async loginWithPrivy(input: PrivyLoginDto, context: AuthRequestContext) {
    if (!input.accessToken) {
      throw new DatabaseValidationError("accessToken is required");
    }

    try {
      const verified = await this.privyAuthService.verifyAccessToken(input.accessToken);
      const privyUser = await this.privyAuthService.getUserFromIdentityToken(input.identityToken);
      const user = await this.userRepository.upsertUser({
        externalAuthSubject: verified.user_id,
        displayName: this.privyAuthService.getDisplayName(privyUser),
        email: this.privyAuthService.getPrimaryEmail(privyUser),
        role: "user"
      });
      if (!user) {
        throw new DatabaseValidationError("Unable to create authenticated user");
      }

      const wallets: LoginWallet[] = this.privyAuthService.getEthereumWallets(privyUser);
      if (input.walletAddress) {
        wallets.unshift({
          address: input.walletAddress,
          chainId: input.chainId ?? 8453,
          label: "Login wallet"
        });
      }

      const seenWallets = new Set<string>();
      for (const [index, wallet] of wallets.entries()) {
        const walletKey = `${wallet.address.toLowerCase()}:${wallet.chainId}`;
        if (seenWallets.has(walletKey)) {
          continue;
        }

        seenWallets.add(walletKey);
        await this.userRepository.addWallet({
          userId: user.id,
          address: wallet.address,
          chainId: wallet.chainId,
          label: wallet.label,
          isPrimary: index === 0
        });

        await this.auditLogService.recordEvent({
          eventType: "auth.wallet.linked",
          category: "security",
          source: "backend-api",
          actorUserId: user.id,
          walletAddress: wallet.address,
          chainId: wallet.chainId,
          result: "success",
          metadata: {
            provider: "privy"
          }
        });
      }

      const sessionToken = createSessionToken();
      const session = await this.sessionRepository.create({
        userId: user.id,
        sessionHash: hashSessionToken(sessionToken),
        provider: "privy",
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        expiresAt: this.privyAuthService.getSessionExpiration(verified)
      });
      if (!session) {
        throw new DatabaseValidationError("Unable to create authenticated session");
      }

      await this.auditLogService.recordAuditAction({
        actorUserId: user.id,
        action: "auth.login",
        origin: "backend-api",
        targetType: "session",
        targetId: session.id,
        result: "success",
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        metadata: {
          provider: "privy",
          privyUserId: verified.user_id
        }
      });

      this.structuredLogger.info({
        event: "auth.login",
        source: "backend-api",
        result: "success",
        metadata: {
          userId: user.id,
          provider: "privy"
        }
      });

      return {
        sessionToken,
        expiresAt: session.expires_at,
        user: this.mapUser(user),
        wallets: await this.getMappedWallets(user.id),
        custody: {
          backendCustody: false,
          privateKeysStored: false,
          financialSourceOfTruth: "blockchain"
        }
      };
    } catch (error) {
      await this.auditLogService.recordAuditAction({
        action: "auth.login.failed",
        origin: "backend-api",
        targetType: "session",
        result: "failure",
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        metadata: {
          provider: "privy",
          reason: error instanceof Error ? error.message : "unknown"
        }
      });

      this.structuredLogger.warn({
        event: "auth.login.failed",
        source: "backend-api",
        result: "failure",
        metadata: {
          provider: "privy",
          reason: error instanceof Error ? error.message : "unknown"
        }
      });

      throw error;
    }
  }

  async logout(input: PrivyLogoutDto, context: AuthRequestContext) {
    if (!input.sessionToken) {
      throw new DatabaseValidationError("sessionToken is required");
    }

    const sessionHash = hashSessionToken(input.sessionToken);
    const activeSession = await this.sessionRepository.findActive(sessionHash);
    const revoked = await this.sessionRepository.revoke(sessionHash);

    await this.auditLogService.recordAuditAction({
      actorUserId: activeSession?.user_id ?? null,
      action: "auth.logout",
      origin: "backend-api",
      targetType: "session",
      targetId: activeSession?.id ?? revoked?.id ?? null,
      result: revoked ? "success" : "failure",
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
      metadata: {
        provider: "privy",
        found: Boolean(revoked)
      }
    });

    this.structuredLogger.info({
      event: "auth.logout",
      source: "backend-api",
      result: revoked ? "success" : "failure",
      metadata: {
        userId: activeSession?.user_id ?? null
      }
    });

    return { revoked: Boolean(revoked) };
  }

  async validateSessionToken(sessionToken: string): Promise<AuthenticatedSession> {
    if (!sessionToken) {
      throw new UnauthorizedException("Session token is required");
    }

    const session = await this.sessionRepository.findActive(hashSessionToken(sessionToken));
    if (!session?.user_id) {
      throw new UnauthorizedException("Invalid or expired session");
    }

    const user = await this.userRepository.findById(session.user_id);
    if (!user || user.status !== "active") {
      throw new UnauthorizedException("User is not active");
    }

    return {
      session: {
        id: session.id,
        expiresAt: session.expires_at,
        provider: session.provider
      },
      user: this.mapUser(user),
      wallets: await this.getMappedWallets(user.id)
    };
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

  private async getMappedWallets(userId: string) {
    const wallets = await this.userRepository.listWallets(userId);
    return wallets.map((wallet) => ({
      id: wallet.id,
      address: wallet.address,
      chainId: wallet.chain_id,
      label: wallet.label,
      isPrimary: wallet.is_primary,
      verifiedAt: wallet.verified_at
    }));
  }

  private mapUser(user: {
    id: string;
    external_auth_subject: string | null;
    display_name: string | null;
    email: string | null;
    role: UserRole;
    status?: string;
  }) {
    return {
      id: user.id,
      externalAuthSubject: user.external_auth_subject,
      displayName: user.display_name,
      email: user.email,
      role: user.role,
      status: user.status ?? "active"
    };
  }
}

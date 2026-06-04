import { Injectable } from "@nestjs/common";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { DatabaseValidationError } from "../database/database.errors";
import { AuditLogService } from "../database/services/audit-log.service";
import { UserRepository } from "../database/repositories/user.repository";
import type { AddWalletDto, CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditLogService: AuditLogService,
    private readonly logger: StructuredLogger
  ) {}

  getProfile(userId: string) {
    return {
      id: userId,
      displayName: "Cliente Aivor",
      locale: "pt-BR"
    };
  }

  async createOperationalUser(input: CreateUserDto) {
    const user = await this.userRepository.upsertUser(input);
    if (!user) throw new DatabaseValidationError("user was not persisted");

    await this.auditLogService.recordEvent({
      eventType: "user.created",
      category: "user",
      source: "backend-api",
      actorUserId: user.id,
      result: "success",
      metadata: {
        hasExternalAuthSubject: Boolean(input.externalAuthSubject),
        locale: input.locale ?? "pt-BR"
      }
    });

    this.logger.info({
      event: "user.created",
      source: "backend-api",
      result: "success",
      metadata: { userId: user.id }
    });

    return user;
  }

  async addWallet(input: AddWalletDto) {
    const wallet = await this.userRepository.addWallet(input);
    if (!wallet) throw new DatabaseValidationError("wallet was not persisted");

    await this.auditLogService.recordEvent({
      eventType: "wallet.linked",
      category: "user",
      source: "backend-api",
      actorUserId: input.userId,
      walletAddress: input.address,
      chainId: input.chainId,
      result: "success",
      metadata: {
        isPrimary: input.isPrimary ?? false
      }
    });

    return wallet;
  }
}

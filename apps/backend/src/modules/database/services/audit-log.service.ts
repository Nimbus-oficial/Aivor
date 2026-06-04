import { Injectable } from "@nestjs/common";
import { AuditRepository } from "../repositories/audit.repository";
import { EventRepository } from "../repositories/event.repository";
import type { AuditLogInput, EventInput } from "../types/database.types";

@Injectable()
export class AuditLogService {
  constructor(
    private readonly auditRepository: AuditRepository,
    private readonly eventRepository: EventRepository
  ) {}

  async recordAuditAction(input: AuditLogInput) {
    return this.auditRepository.create(input);
  }

  async recordEvent(input: EventInput) {
    return this.eventRepository.create(input);
  }
}

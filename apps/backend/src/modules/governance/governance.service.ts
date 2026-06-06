import { ForbiddenException, Injectable } from "@nestjs/common";
import { StructuredLogger } from "../../common/logging/structured-logger.service";
import { DatabaseValidationError } from "../database/database.errors";
import { GovernanceProposalRepository } from "../database/repositories/governance-proposal.repository";
import { AuditLogService } from "../database/services/audit-log.service";
import type {
  GovernanceProposalStatus,
  UserRole
} from "../database/types/database.types";
import type {
  CreateGovernanceProposalDto,
  GovernanceActionDto
} from "./dto/governance.dto";
import { SafeReadonlyService } from "./safe-readonly.service";

interface Actor {
  id: string;
  role: UserRole;
}

@Injectable()
export class GovernanceService {
  constructor(
    private readonly proposalRepository: GovernanceProposalRepository,
    private readonly safeReadonlyService: SafeReadonlyService,
    private readonly auditLogService: AuditLogService,
    private readonly logger: StructuredLogger
  ) {}

  getConfiguration() {
    return this.safeReadonlyService.getConfig();
  }

  getSafeStatus() {
    return this.safeReadonlyService.getStatus();
  }

  async createProposal(input: CreateGovernanceProposalDto, actor: Actor) {
    await this.ensureRole(actor, ["operator", "admin"], "proposal.permission_denied");
    const governanceConfig = this.safeReadonlyService.getConfig();
    const proposal = await this.proposalRepository.create({
      ...input,
      createdBy: actor.id,
      safeAddress: governanceConfig.safeAddress,
      safeChainId: governanceConfig.safeChainId,
      timelockAddress: governanceConfig.timelockAddress
    });
    if (!proposal) {
      throw new DatabaseValidationError("proposal was not persisted");
    }

    await this.recordAudit("proposal.created", actor.id, proposal.id, "success", {
      type: proposal.type,
      status: proposal.status,
      governanceMode: governanceConfig.mode
    });

    return this.mapProposal(proposal);
  }

  async listProposals(status?: GovernanceProposalStatus) {
    const proposals = await this.proposalRepository.list(status);
    return proposals.map((proposal) => this.mapProposal(proposal));
  }

  async getProposal(id: string) {
    const proposal = await this.proposalRepository.findById(id);
    if (!proposal) throw new DatabaseValidationError("proposal not found");
    return this.mapProposal(proposal);
  }

  async approveProposal(id: string, input: GovernanceActionDto, actor: Actor) {
    await this.ensureRole(actor, ["admin"], "proposal.permission_denied");
    const current = await this.requireProposal(id);
    this.ensureStatus(current.status, ["draft"], "proposal can only be approved from draft");
    const proposal = await this.proposalRepository.approve(id, {
      status: "approved",
      actorUserId: actor.id,
      reason: input.reason
    });
    return this.afterAction("proposal.approved", proposal, actor.id);
  }

  async rejectProposal(id: string, input: GovernanceActionDto, actor: Actor) {
    await this.ensureRole(actor, ["admin"], "proposal.permission_denied");
    const current = await this.requireProposal(id);
    this.ensureStatus(current.status, ["draft", "approved"], "proposal cannot be rejected from current status");
    const proposal = await this.proposalRepository.reject(id, {
      status: "rejected",
      actorUserId: actor.id,
      reason: input.reason
    });
    return this.afterAction("proposal.rejected", proposal, actor.id);
  }

  async cancelProposal(id: string, input: GovernanceActionDto, actor: Actor) {
    await this.ensureRole(actor, ["admin"], "proposal.permission_denied");
    const current = await this.requireProposal(id);
    this.ensureStatus(current.status, ["draft", "approved", "ready", "queued"], "proposal cannot be cancelled from current status");
    const proposal = await this.proposalRepository.cancel(id, {
      status: "cancelled",
      actorUserId: actor.id,
      reason: input.reason
    });
    return this.afterAction("proposal.cancelled", proposal, actor.id);
  }

  async markReady(id: string, input: GovernanceActionDto, actor: Actor) {
    await this.ensureRole(actor, ["admin"], "proposal.permission_denied");
    const current = await this.requireProposal(id);
    this.ensureStatus(current.status, ["approved"], "proposal must be approved before ready");
    const proposal = await this.proposalRepository.approve(id, {
      status: "ready",
      actorUserId: actor.id,
      reason: input.reason
    });
    return this.afterAction("proposal.ready", proposal, actor.id);
  }

  async queueProposal(id: string, input: GovernanceActionDto, actor: Actor) {
    await this.ensureRole(actor, ["admin"], "proposal.permission_denied");
    const current = await this.requireProposal(id);
    this.ensureStatus(current.status, ["ready"], "proposal must be ready before queue");
    const proposal = await this.proposalRepository.queue(id, {
      status: "queued",
      actorUserId: actor.id,
      reason: input.reason,
      timelockOperationId: `simulated-${id}`
    });
    return this.afterAction("proposal.queued", proposal, actor.id);
  }

  async executeSimulated(id: string, input: GovernanceActionDto, actor: Actor) {
    await this.ensureRole(actor, ["admin"], "proposal.permission_denied");
    const current = await this.requireProposal(id);
    this.ensureStatus(current.status, ["queued"], "proposal must be queued before simulated execution");
    const proposal = await this.proposalRepository.executeSimulated(id, {
      status: "executed_simulated",
      actorUserId: actor.id,
      reason: input.reason
    });
    return this.afterAction("proposal.executed_simulated", proposal, actor.id);
  }

  private async requireProposal(id: string) {
    const proposal = await this.proposalRepository.findById(id);
    if (!proposal) throw new DatabaseValidationError("proposal not found");
    return proposal;
  }

  private async ensureRole(actor: Actor, allowedRoles: UserRole[], auditAction: string) {
    if (allowedRoles.includes(actor.role)) return;
    await this.recordAudit(auditAction, actor.id, null, "failure", {
      actorRole: actor.role,
      allowedRoles
    });
    throw new ForbiddenException("Actor does not have governance permission");
  }

  private ensureStatus(
    status: GovernanceProposalStatus,
    allowed: GovernanceProposalStatus[],
    message: string
  ) {
    if (!allowed.includes(status)) {
      throw new DatabaseValidationError(message);
    }
  }

  private async afterAction(
    action: string,
    proposal:
      | Awaited<ReturnType<GovernanceProposalRepository["approve"]>>
      | Awaited<ReturnType<GovernanceProposalRepository["reject"]>>
      | Awaited<ReturnType<GovernanceProposalRepository["cancel"]>>,
    actorUserId: string
  ) {
    if (!proposal) throw new DatabaseValidationError("proposal was not updated");
    await this.recordAudit(action, actorUserId, proposal.id, "success", {
      status: proposal.status,
      type: proposal.type
    });
    return this.mapProposal(proposal);
  }

  private async recordAudit(
    action: string,
    actorUserId: string | null,
    targetId: string | null,
    result: "success" | "failure",
    metadata: Record<string, unknown>
  ) {
    await this.auditLogService.recordAuditAction({
      actorUserId,
      action,
      origin: "backend-api",
      targetType: "governance_proposals",
      targetId,
      result,
      metadata
    });

    this.logger.info({
      event: action,
      source: "backend-governance",
      result,
      metadata
    });
  }

  private mapProposal(proposal: Awaited<ReturnType<GovernanceProposalRepository["findById"]>>) {
    if (!proposal) throw new DatabaseValidationError("proposal not found");
    return {
      id: proposal.id,
      type: proposal.type,
      title: proposal.title,
      description: proposal.description,
      payload: proposal.payload,
      status: proposal.status,
      createdBy: proposal.created_by,
      approvedBy: proposal.approved_by,
      rejectedBy: proposal.rejected_by,
      cancelledBy: proposal.cancelled_by,
      queuedBy: proposal.queued_by,
      executedBy: proposal.executed_by,
      reason: proposal.reason,
      safeAddress: proposal.safe_address,
      safeChainId: proposal.safe_chain_id,
      timelockAddress: proposal.timelock_address,
      safeTxHash: proposal.safe_tx_hash,
      timelockOperationId: proposal.timelock_operation_id,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
      approvedAt: proposal.approved_at,
      rejectedAt: proposal.rejected_at,
      cancelledAt: proposal.cancelled_at,
      readyAt: proposal.ready_at,
      queuedAt: proposal.queued_at,
      executedAt: proposal.executed_at,
      execution: {
        simulatedOnly: true,
        realOnchainExecution: false,
        fundsMovement: false
      }
    };
  }
}

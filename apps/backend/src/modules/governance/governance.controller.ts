import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ok } from "../../common/responses/api-response";
import type { AuthenticatedSession } from "../auth/auth.service";
import { Roles, RolesGuard } from "../auth/roles.guard";
import type {
  CreateGovernanceProposalDto,
  GovernanceActionDto,
  ListGovernanceProposalsQuery
} from "./dto/governance.dto";
import { GovernanceService } from "./governance.service";

interface RequestWithUser {
  user?: AuthenticatedSession;
}

@Controller("governance")
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get("config")
  getConfiguration() {
    return ok(this.governanceService.getConfiguration(), "system");
  }

  @Get("safe/status")
  async getSafeStatus() {
    const status = await this.governanceService.getSafeStatus();
    return ok(status, "system");
  }

  @Get("proposals")
  async listProposals(@Query() query: ListGovernanceProposalsQuery) {
    const proposals = await this.governanceService.listProposals(query.status);
    return ok(proposals, "database");
  }

  @Get("proposals/:proposalId")
  async getProposal(@Param("proposalId") proposalId: string) {
    const proposal = await this.governanceService.getProposal(proposalId);
    return ok(proposal, "database");
  }

  @Post("proposals")
  @UseGuards(RolesGuard)
  @Roles("user", "operator", "admin")
  async createProposal(
    @Body() body: CreateGovernanceProposalDto,
    @Req() request: RequestWithUser
  ) {
    const proposal = await this.governanceService.createProposal(body, this.getActor(request));
    return ok(proposal, "database");
  }

  @Post("proposals/:proposalId/approve")
  @UseGuards(RolesGuard)
  @Roles("user", "operator", "admin")
  async approveProposal(
    @Param("proposalId") proposalId: string,
    @Body() body: GovernanceActionDto,
    @Req() request: RequestWithUser
  ) {
    const proposal = await this.governanceService.approveProposal(proposalId, body ?? {}, this.getActor(request));
    return ok(proposal, "database");
  }

  @Post("proposals/:proposalId/reject")
  @UseGuards(RolesGuard)
  @Roles("user", "operator", "admin")
  async rejectProposal(
    @Param("proposalId") proposalId: string,
    @Body() body: GovernanceActionDto,
    @Req() request: RequestWithUser
  ) {
    const proposal = await this.governanceService.rejectProposal(proposalId, body ?? {}, this.getActor(request));
    return ok(proposal, "database");
  }

  @Post("proposals/:proposalId/cancel")
  @UseGuards(RolesGuard)
  @Roles("user", "operator", "admin")
  async cancelProposal(
    @Param("proposalId") proposalId: string,
    @Body() body: GovernanceActionDto,
    @Req() request: RequestWithUser
  ) {
    const proposal = await this.governanceService.cancelProposal(proposalId, body ?? {}, this.getActor(request));
    return ok(proposal, "database");
  }

  @Post("proposals/:proposalId/ready")
  @UseGuards(RolesGuard)
  @Roles("user", "operator", "admin")
  async markReady(
    @Param("proposalId") proposalId: string,
    @Body() body: GovernanceActionDto,
    @Req() request: RequestWithUser
  ) {
    const proposal = await this.governanceService.markReady(proposalId, body ?? {}, this.getActor(request));
    return ok(proposal, "database");
  }

  @Post("proposals/:proposalId/queue")
  @UseGuards(RolesGuard)
  @Roles("user", "operator", "admin")
  async queueProposal(
    @Param("proposalId") proposalId: string,
    @Body() body: GovernanceActionDto,
    @Req() request: RequestWithUser
  ) {
    const proposal = await this.governanceService.queueProposal(proposalId, body ?? {}, this.getActor(request));
    return ok(proposal, "database");
  }

  @Post("proposals/:proposalId/execute-simulated")
  @UseGuards(RolesGuard)
  @Roles("user", "operator", "admin")
  async executeSimulated(
    @Param("proposalId") proposalId: string,
    @Body() body: GovernanceActionDto,
    @Req() request: RequestWithUser
  ) {
    const proposal = await this.governanceService.executeSimulated(proposalId, body ?? {}, this.getActor(request));
    return ok(proposal, "database");
  }

  private getActor(request: RequestWithUser) {
    if (!request.user) {
      throw new Error("AUTHENTICATED_SESSION_REQUIRED");
    }

    return {
      id: request.user.user.id,
      role: request.user.user.role
    };
  }
}

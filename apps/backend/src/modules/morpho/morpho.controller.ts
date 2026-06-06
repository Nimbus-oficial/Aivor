import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ok } from "../../common/responses/api-response";
import type { AuthenticatedSession } from "../auth/auth.service";
import { Roles, RolesGuard } from "../auth/roles.guard";
import type { MorphoMarketActionDto, MorphoSimulationActionDto } from "./dto/morpho.dto";
import { MorphoService } from "./morpho.service";

interface RequestWithUser {
  user?: AuthenticatedSession;
}

@Controller("morpho")
export class MorphoController {
  constructor(private readonly morphoService: MorphoService) {}

  @Get("markets")
  async getMarkets() {
    return ok(await this.morphoService.getMarketsOverviewReadOnly(), "system");
  }

  @Get("markets/:marketId")
  async getMarket(@Param("marketId") marketId: string) {
    return ok(await this.morphoService.getMarketDetail(marketId), "system");
  }

  @Get("markets/:marketId/risk-history")
  async getRiskHistory(@Param("marketId") marketId: string) {
    return ok(await this.morphoService.getRiskHistory(marketId), "database");
  }

  @Get("simulation")
  async getSimulation() {
    return ok(await this.morphoService.getSimulationOverview(), "mock");
  }

  @Post("simulation/start")
  @UseGuards(RolesGuard)
  @Roles("operator", "admin")
  async startSimulation(@Body() body: MorphoSimulationActionDto, @Req() request: RequestWithUser) {
    return ok(await this.morphoService.startSimulation(body, this.getActorId(request)), "mock");
  }

  @Post("simulation/deposit")
  @UseGuards(RolesGuard)
  @Roles("operator", "admin")
  async simulateDeposit(@Body() body: MorphoSimulationActionDto, @Req() request: RequestWithUser) {
    return ok(await this.morphoService.simulateDeposit(body, this.getActorId(request)), "mock");
  }

  @Post("simulation/allocation")
  @UseGuards(RolesGuard)
  @Roles("operator", "admin")
  async simulateAllocation(@Body() body: MorphoSimulationActionDto, @Req() request: RequestWithUser) {
    return ok(await this.morphoService.simulateAllocation(body, this.getActorId(request)), "mock");
  }

  @Post("simulation/yield")
  @UseGuards(RolesGuard)
  @Roles("operator", "admin")
  async simulateYield(@Body() body: MorphoSimulationActionDto, @Req() request: RequestWithUser) {
    return ok(await this.morphoService.simulateYield(body, this.getActorId(request)), "mock");
  }

  @Post("simulation/loss")
  @UseGuards(RolesGuard)
  @Roles("operator", "admin")
  async simulateLoss(@Body() body: MorphoSimulationActionDto, @Req() request: RequestWithUser) {
    return ok(await this.morphoService.simulateLoss(body, this.getActorId(request)), "mock");
  }

  @Post("simulation/rebalance")
  @UseGuards(RolesGuard)
  @Roles("operator", "admin")
  async simulateRebalance(@Body() body: MorphoSimulationActionDto, @Req() request: RequestWithUser) {
    return ok(await this.morphoService.simulateRebalance(body, this.getActorId(request)), "mock");
  }

  @Post("simulation/withdraw")
  @UseGuards(RolesGuard)
  @Roles("operator", "admin")
  async simulateWithdraw(@Body() body: MorphoSimulationActionDto, @Req() request: RequestWithUser) {
    return ok(await this.morphoService.simulateWithdraw(body, this.getActorId(request)), "mock");
  }

  @Post("markets/:marketId/approve")
  @UseGuards(RolesGuard)
  @Roles("admin")
  async approveMarket(
    @Param("marketId") marketId: string,
    @Body() body: MorphoMarketActionDto,
    @Req() request: RequestWithUser
  ) {
    return ok(
      await this.morphoService.setMarketStatus(marketId, "eligible", body, this.getActorId(request)),
      "database"
    );
  }

  @Post("markets/:marketId/reject")
  @UseGuards(RolesGuard)
  @Roles("admin")
  async rejectMarket(
    @Param("marketId") marketId: string,
    @Body() body: MorphoMarketActionDto,
    @Req() request: RequestWithUser
  ) {
    return ok(
      await this.morphoService.setMarketStatus(marketId, "rejected", body, this.getActorId(request)),
      "database"
    );
  }

  @Post("markets/:marketId/disable")
  @UseGuards(RolesGuard)
  @Roles("admin")
  async disableMarket(
    @Param("marketId") marketId: string,
    @Body() body: MorphoMarketActionDto,
    @Req() request: RequestWithUser
  ) {
    return ok(
      await this.morphoService.setMarketStatus(marketId, "disabled", body, this.getActorId(request)),
      "database"
    );
  }

  private getActorId(request: RequestWithUser) {
    if (!request.user) throw new Error("AUTHENTICATED_SESSION_REQUIRED");
    return request.user.user.id;
  }
}

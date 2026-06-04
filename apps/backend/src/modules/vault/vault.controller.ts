import { Controller, Get } from "@nestjs/common";
import { ok } from "../../common/responses/api-response";
import { VaultService } from "./vault.service";

@Controller("vault")
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get("account-summary")
  getPublicAccountSummary() {
    return this.vaultService.getPublicAccountSummary();
  }

  @Get("operational-policy")
  getOperationalPolicy() {
    return this.vaultService.getOperationalPolicy();
  }

  @Get("admin-overview")
  getAdminOverview() {
    return this.vaultService.getAdminOverview();
  }

  @Get("onchain/config")
  getOnChainConfig() {
    return ok(this.vaultService.getOnChainConfig(), "system");
  }

  @Get("onchain/status")
  async getOnChainStatus() {
    return ok(await this.vaultService.getOnChainStatus(), "onchain");
  }

  @Get("onchain/vault")
  async getOnChainVaultData() {
    return ok(await this.vaultService.getOnChainVaultData(), "onchain");
  }
}

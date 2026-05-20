import { Injectable } from "@nestjs/common";

@Injectable()
export class VaultService {
  getPublicAccountSummary() {
    return {
      balanceUsd: "0.00",
      earningsUsd: "0.00",
      withdrawalsEnabled: true
    };
  }

  getOperationalPolicy() {
    return {
      targetInternalLiquidityBps: 1000,
      targetMorphoAllocationBps: 9000,
      performanceFeeBps: 1500
    };
  }
}

import { Injectable } from "@nestjs/common";
import { OperationalSettingsRepository } from "../repositories/operational-settings.repository";

@Injectable()
export class OperationalSettingsService {
  constructor(private readonly settingsRepository: OperationalSettingsRepository) {}

  getLiquidityPolicy() {
    return this.settingsRepository.get("liquidity_policy");
  }

  saveOfficialLiquidityPolicy(updatedBy?: string | null) {
    return this.settingsRepository.upsert({
      key: "liquidity_policy",
      value: {
        minBps: 200,
        targetBps: 500,
        maxBps: 700
      },
      description: "Official idle liquidity policy: 2% minimum, 5% target, 7% maximum.",
      updatedBy
    });
  }

  saveGovernancePolicy(updatedBy?: string | null) {
    return this.settingsRepository.upsert({
      key: "governance_policy",
      value: {
        multisig: "Safe 2-of-4",
        timelockRequired: true,
        emergencyPauseAllowed: true
      },
      description: "Official governance policy for critical administrative actions.",
      updatedBy
    });
  }
}

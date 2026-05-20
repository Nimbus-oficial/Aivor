import { Injectable } from "@nestjs/common";

@Injectable()
export class AiService {
  getGuardrails() {
    return {
      canRecommendInvestments: false,
      canMoveFunds: false,
      canAutonomouslyAct: false,
      allowedScopes: ["onboarding", "support", "account_questions"]
    };
  }
}

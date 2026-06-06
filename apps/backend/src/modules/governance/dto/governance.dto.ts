import type {
  GovernanceProposalStatus,
  GovernanceProposalType
} from "../../database/types/database.types";

export interface CreateGovernanceProposalDto {
  type: GovernanceProposalType;
  title: string;
  description: string;
  payload?: Record<string, unknown>;
  reason?: string | null;
}

export interface GovernanceActionDto {
  reason?: string | null;
}

export interface ListGovernanceProposalsQuery {
  status?: GovernanceProposalStatus;
}

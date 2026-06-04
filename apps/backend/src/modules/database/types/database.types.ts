export type QueryValue =
  | string
  | number
  | boolean
  | Date
  | null
  | string[]
  | Record<string, unknown>;

export type EventCategory =
  | "user"
  | "operation"
  | "governance"
  | "security"
  | "blockchain"
  | "system";

export type RecordResult = "success" | "failure" | "pending";
export type UserRole = "user" | "operator" | "admin";

export interface AuditLogInput {
  actorUserId?: string | null;
  actorWalletAddress?: string | null;
  action: string;
  origin: string;
  targetType: string;
  targetId?: string | null;
  result: RecordResult;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

export interface EventInput {
  eventType: string;
  category: EventCategory;
  source: string;
  actorUserId?: string | null;
  walletAddress?: string | null;
  chainId?: number | null;
  txHash?: string | null;
  result: RecordResult;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
}

export interface OperationalSettingInput {
  key: string;
  value: Record<string, unknown> | string[];
  description: string;
  isSensitive?: boolean;
  updatedBy?: string | null;
}

export interface PositionSnapshotInput {
  userId?: string | null;
  walletAddress?: string | null;
  assetSymbol: "USDC" | "EURC" | "ovUSDC";
  chainId: number;
  vaultAddress?: string | null;
  shareBalance: string;
  assetValue: string;
  sharePrice: string;
  source: "blockchain" | "indexer" | "manual_reconciliation";
  observedAt: Date;
}

import { DatabaseValidationError } from "./database.errors";
import type { EventCategory, RecordResult } from "./types/database.types";

const walletAddressPattern = /^0x[0-9a-fA-F]{40}$/;
const txHashPattern = /^0x[0-9a-fA-F]{64}$/;
const eventCategories = new Set<EventCategory>([
  "user",
  "operation",
  "governance",
  "security",
  "blockchain",
  "system"
]);
const results = new Set<RecordResult>(["success", "failure", "pending"]);

export function requireNonEmpty(value: string, field: string) {
  if (!value.trim()) {
    throw new DatabaseValidationError(`${field} is required`);
  }
}

export function validateWalletAddress(value?: string | null) {
  if (value && !walletAddressPattern.test(value)) {
    throw new DatabaseValidationError("wallet address must be a valid EVM address");
  }
}

export function validateTxHash(value?: string | null) {
  if (value && !txHashPattern.test(value)) {
    throw new DatabaseValidationError("transaction hash must be a valid EVM hash");
  }
}

export function validateEventCategory(value: EventCategory) {
  if (!eventCategories.has(value)) {
    throw new DatabaseValidationError("event category is not supported");
  }
}

export function validateResult(value: RecordResult) {
  if (!results.has(value)) {
    throw new DatabaseValidationError("result is not supported");
  }
}

export function validateBasisPoints(value: unknown, field: string) {
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 10_000) {
    throw new DatabaseValidationError(`${field} must be an integer basis point value`);
  }
}

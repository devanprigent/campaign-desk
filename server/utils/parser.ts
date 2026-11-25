// Turns raw request input (query strings, JSON bodies) into typed inputs,
// collecting one FieldError per invalid field. Checks shape only: business
// rules live in rules/. Usable by API controllers and page loaders/actions.
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants";
import { ValidationError, type FieldError } from "../errors";
import type { NewCampaignInput } from "../models/campaign";
import {
  OPPORTUNITY_ACTIONS,
  OPPORTUNITY_STATUSES,
  type OpportunityFilters,
  type Pagination,
} from "../models/opportunity";

export function parseOpportunityListQuery(query: Record<string, unknown>): {
  filters: OpportunityFilters;
  pagination: Pagination;
} {
  const errors: FieldError[] = [];
  const read = (name: string): string | undefined => {
    const value = query[name];
    if (value === undefined || value === "") return undefined;
    if (typeof value !== "string") {
      errors.push({ field: name, message: "must be a single value" });
      return undefined;
    }
    return value;
  };

  const chainId = parseInteger(read("chainId"), "chainId", 1, errors);
  const action = parseEnum(read("action"), "action", OPPORTUNITY_ACTIONS, errors);
  const status = parseEnum(read("status"), "status", OPPORTUNITY_STATUSES, errors);
  const minTvlUsd = parseNumber(read("minTvl"), "minTvl", errors);
  const page = parseInteger(read("page"), "page", 0, errors) ?? 0;
  const pageSize =
    parseInteger(read("pageSize"), "pageSize", 1, errors) ?? DEFAULT_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) {
    errors.push({ field: "pageSize", message: `must be at most ${MAX_PAGE_SIZE}` });
  }

  if (errors.length > 0) throw new ValidationError(errors);
  return {
    filters: { chainId, action, status, minTvlUsd },
    pagination: { page, pageSize },
  };
}

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const UNSIGNED_INTEGER_PATTERN = /^\d+$/;

/**
 * Body of a campaign creation. `amount` is a string of digits in the token's
 * smallest unit (a JSON number would lose precision above 2^53).
 */
export function parseCreateCampaignBody(body: unknown): NewCampaignInput {
  const input = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const errors: FieldError[] = [];

  const tokenAddress = input.tokenAddress;
  if (typeof tokenAddress !== "string" || !ADDRESS_PATTERN.test(tokenAddress)) {
    errors.push({ field: "tokenAddress", message: "must be a 0x-prefixed 20-byte hex address" });
  }

  const amount = input.amount;
  let amountUnits = 0n;
  if (typeof amount !== "string" || !UNSIGNED_INTEGER_PATTERN.test(amount) || BigInt(amount) === 0n) {
    errors.push({
      field: "amount",
      message: "must be a positive integer string in the token's smallest unit",
    });
  } else {
    amountUnits = BigInt(amount);
  }

  const startAt = parseDate(input.startAt, "startAt", errors);
  const endAt = parseDate(input.endAt, "endAt", errors);

  if (errors.length > 0 || !startAt || !endAt) throw new ValidationError(errors);
  return { tokenAddress: tokenAddress as string, amount: amountUnits, startAt, endAt };
}

function parseDate(value: unknown, field: string, errors: FieldError[]): Date | undefined {
  const date = typeof value === "string" ? new Date(value) : undefined;
  if (!date || Number.isNaN(date.getTime())) {
    errors.push({ field, message: "must be an ISO 8601 date, e.g. 2026-12-01T00:00:00Z" });
    return undefined;
  }
  return date;
}

export function parseInteger(
  value: string | undefined,
  field: string,
  min: number,
  errors: FieldError[],
): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min) {
    errors.push({ field, message: `must be an integer >= ${min}` });
    return undefined;
  }
  return parsed;
}

export function parseNumber(
  value: string | undefined,
  field: string,
  errors: FieldError[],
): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    errors.push({ field, message: "must be a number >= 0" });
    return undefined;
  }
  return parsed;
}

export function parseEnum<T extends string>(
  value: string | undefined,
  field: string,
  allowed: readonly T[],
  errors: FieldError[],
): T | undefined {
  if (value === undefined) return undefined;
  const upper = value.toUpperCase();
  if (!(allowed as readonly string[]).includes(upper)) {
    errors.push({ field, message: `must be one of ${allowed.join(", ")}` });
    return undefined;
  }
  return upper as T;
}

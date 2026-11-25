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
const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;
// What <input type="datetime-local"> submits: no time zone.
const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

/**
 * JSON body of a campaign creation. `amount` is a string of digits in the
 * token's smallest unit (a JSON number would lose precision above 2^53).
 * Dates are ISO 8601 with a time zone.
 */
export function parseCreateCampaignBody(body: unknown): NewCampaignInput {
  const input = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const errors: FieldError[] = [];

  const tokenAddress = parseAddress(input.tokenAddress, errors);
  const amount = input.amount;
  const amountIsValid =
    typeof amount === "string" && UNSIGNED_INTEGER_PATTERN.test(amount) && BigInt(amount) > 0n;
  if (!amountIsValid) {
    errors.push({ field: "amount", message: "must be a positive integer string in the token's smallest unit" });
  }
  const startAt = parseIsoDate(input.startAt, "startAt", errors);
  const endAt = parseIsoDate(input.endAt, "endAt", errors);

  if (errors.length > 0 || !tokenAddress || !startAt || !endAt) throw new ValidationError(errors);
  return { tokenAddress, amount: { unit: "smallest", value: BigInt(amount as string) }, startAt, endAt };
}

/**
 * HTML form fields of a campaign creation. `amount` is in tokens ("1000.5");
 * dates come from datetime-local inputs and are read as UTC.
 */
export function parseCreateCampaignForm(form: Record<string, unknown>): NewCampaignInput {
  const errors: FieldError[] = [];

  const tokenAddress = parseAddress(form.tokenAddress, errors);
  const amount = form.amount;
  const amountIsValid = typeof amount === "string" && DECIMAL_PATTERN.test(amount) && /[1-9]/.test(amount);
  if (!amountIsValid) {
    errors.push({ field: "amount", message: "must be a positive number, e.g. 1000 or 1000.5" });
  }
  const startAt = parseUtcDateTimeLocal(form.startAt, "startAt", errors);
  const endAt = parseUtcDateTimeLocal(form.endAt, "endAt", errors);

  if (errors.length > 0 || !tokenAddress || !startAt || !endAt) throw new ValidationError(errors);
  return { tokenAddress, amount: { unit: "token", value: amount as string }, startAt, endAt };
}

function parseAddress(value: unknown, errors: FieldError[]): string | undefined {
  if (typeof value === "string" && ADDRESS_PATTERN.test(value)) return value;
  errors.push({ field: "tokenAddress", message: "must be a 0x-prefixed 20-byte hex address" });
  return undefined;
}

function parseIsoDate(value: unknown, field: string, errors: FieldError[]): Date | undefined {
  const date = typeof value === "string" ? new Date(value) : undefined;
  if (!date || Number.isNaN(date.getTime())) {
    errors.push({ field, message: "must be an ISO 8601 date, e.g. 2026-12-01T00:00:00Z" });
    return undefined;
  }
  return date;
}

function parseUtcDateTimeLocal(value: unknown, field: string, errors: FieldError[]): Date | undefined {
  const date =
    typeof value === "string" && DATETIME_LOCAL_PATTERN.test(value) ? new Date(`${value}Z`) : undefined;
  if (!date || Number.isNaN(date.getTime())) {
    errors.push({ field, message: "must be a date and time" });
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

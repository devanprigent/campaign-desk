// Shape of a campaign creation, for both entry points. Both parse to
// NewCampaignInput; business rules are applied afterwards by the service.
import { z } from "zod";

import type { NewCampaignInput } from "../models/campaign";

const ADDRESS_MESSAGE = "must be a 0x-prefixed 20-byte hex address";
const tokenAddress = z
  .string({ error: ADDRESS_MESSAGE })
  .regex(/^0x[0-9a-fA-F]{40}$/, { error: ADDRESS_MESSAGE });

/**
 * JSON API: `amount` is a string of digits in the token's smallest unit (a
 * JSON number would lose precision above 2^53). Dates are ISO 8601 with a
 * time zone ("Z" or "+02:00").
 */
const SMALLEST_UNIT_MESSAGE = "must be a positive integer string in the token's smallest unit";
const ISO_DATE_MESSAGE = "must be an ISO 8601 date with a time zone, e.g. 2026-12-01T00:00:00Z";
const isoDate = z.iso
  .datetime({ offset: true, error: ISO_DATE_MESSAGE })
  .transform((value) => new Date(value));

export const createCampaignBodySchema = z.object(
  {
    tokenAddress,
    amount: z
      .string({ error: SMALLEST_UNIT_MESSAGE })
      .regex(/^\d*[1-9]\d*$/, { error: SMALLEST_UNIT_MESSAGE }) // digits, not all zeros
      .transform((value) => ({ unit: "smallest" as const, value: BigInt(value) })),
    startAt: isoDate,
    endAt: isoDate,
  },
  { error: "must be a JSON object" },
) satisfies z.ZodType<NewCampaignInput>;

/**
 * HTML form: `amount` is in tokens ("1000.5"); dates come from datetime-local
 * inputs (no time zone) and are read as UTC, like the page displays them.
 */
const TOKEN_AMOUNT_MESSAGE = "must be a positive number, e.g. 1000 or 1000.5";
const DATE_TIME_MESSAGE = "must be a date and time";
const utcDateTimeLocal = z
  .string({ error: DATE_TIME_MESSAGE })
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/, { error: DATE_TIME_MESSAGE })
  .transform((value) => new Date(`${value}Z`))
  .refine((date) => !Number.isNaN(date.getTime()), { error: DATE_TIME_MESSAGE });

export const createCampaignFormSchema = z.object({
  tokenAddress,
  amount: z
    .string({ error: TOKEN_AMOUNT_MESSAGE })
    .regex(/^\d+(\.\d+)?$/, { error: TOKEN_AMOUNT_MESSAGE })
    .refine((value) => /[1-9]/.test(value), { error: TOKEN_AMOUNT_MESSAGE }) // not zero
    .transform((value) => ({ unit: "token" as const, value })),
  startAt: utcDateTimeLocal,
  endAt: utcDateTimeLocal,
}) satisfies z.ZodType<NewCampaignInput>;

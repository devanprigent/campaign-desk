import { z } from "zod";

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants";
import { OPPORTUNITY_ACTIONS, OPPORTUNITY_STATUSES } from "../models/opportunity";

function queryParam<T extends z.ZodType<unknown, string>>(schema: T) {
  return z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string({ error: "must be a single value" }).pipe(schema).optional(),
  );
}

function integer(min: number, max = Number.MAX_SAFE_INTEGER) {
  return z
    .string()
    .transform(Number)
    .pipe(
      z
        .number({ error: `must be an integer >= ${min}` })
        .int({ error: `must be an integer >= ${min}` })
        .min(min, { error: `must be an integer >= ${min}` })
        .max(max, { error: `must be at most ${max}` }),
    );
}

const nonNegativeNumber = z
  .string()
  .transform(Number)
  .pipe(z.number({ error: "must be a number >= 0" }).min(0, { error: "must be a number >= 0" }));

function oneOf<const T extends readonly [string, ...string[]]>(values: T) {
  return z
    .string()
    .transform((value) => value.toUpperCase())
    .pipe(z.enum(values, { error: `must be one of ${values.join(", ")}` }));
}

export const opportunityListQuerySchema = z
  .object({
    chainId: queryParam(integer(1)),
    action: queryParam(oneOf(OPPORTUNITY_ACTIONS)),
    status: queryParam(oneOf(OPPORTUNITY_STATUSES)),
    minTvl: queryParam(nonNegativeNumber),
    page: queryParam(integer(0)),
    pageSize: queryParam(integer(1, MAX_PAGE_SIZE)),
  })
  .transform((q) => ({
    filters: { chainId: q.chainId, action: q.action, status: q.status, minTvlUsd: q.minTvl },
    pagination: { page: q.page ?? 0, pageSize: q.pageSize ?? DEFAULT_PAGE_SIZE },
  }));

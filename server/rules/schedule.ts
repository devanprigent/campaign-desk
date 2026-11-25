import type { FieldError } from "../errors";

export function checkSchedule(startAt: Date, endAt: Date, now: Date): FieldError[] {
  const errors: FieldError[] = [];
  if (startAt.getTime() < now.getTime()) {
    errors.push({ field: "startAt", message: "must not be in the past" });
  }
  if (endAt.getTime() <= startAt.getTime()) {
    errors.push({ field: "endAt", message: "must be after the start date" });
  }
  return errors;
}

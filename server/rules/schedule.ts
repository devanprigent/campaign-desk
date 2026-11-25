// Campaign dates: the campaign cannot start in the past and must end after it
// starts. `now` is a parameter so the rule stays pure and testable.
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

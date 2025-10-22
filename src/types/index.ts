import { DateTime } from "luxon";

export type ApiSuccessResponse = { date: string };
export type ApiErrorResponse = { error: string; message: string };

export interface CalculateParams {
  days: number;
  hours: number;
  date: DateTime; // ISO UTC with Z
}

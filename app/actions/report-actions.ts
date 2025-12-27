// app/actions/report-actions.ts
"use server";

import { reportSchema } from "@/lib/schemas/report-schema";

export async function submitReportAction(data: unknown) {
  const parsed = reportSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // тут Google Sheets API (як у попередньому повідомленні)

  return { ok: true };
}

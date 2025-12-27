import { z } from "zod";

export const reportSchema = z
  .object({
    dropDate: z.string(),
    dropTime: z.string().min(3, "Вкажіть час"),
    missionType: z.enum(["Бойова", "Розвідувальна", "Тестовий політ"]),
    pilot: z.string().min(3, "Обовʼязкове поле"),
    crew: z.string().min(3, "Обовʼязкове поле"),
    uavType: z.string().min(3, "Оберіть тип БпЛА"),
    stream: z.string().optional(),
    targetLocationeventLocation: z.string().optional(),
    targetCoordinates: z.string().optional(),
    resultDescription: z.string().min(5, "Опишіть результат"),
    hitOrLost: z.enum(["Ураження", "Втрата"]),
    hitTarget: z.string().optional(),
    hitResult: z.string().optional(),
    ammoType: z.string().optional(),
    initType: z.string().optional(),
    ammoQuantity: z.coerce.number().optional(),
    targetCoords: z.string().optional(),
    eventCoords: z.string().optional(),
    targetLocation: z.string().optional(),
    eventLocation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.missionType === "Бойова") {
      if (!data.hitTarget) {
        ctx.addIssue({
          path: ["hitTarget"],
          message: "Вкажіть обʼєкт ураження",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (data.hitOrLost === "Втрата" && !data.eventLocation) {
      ctx.addIssue({
        path: ["eventLocation"],
        message: "Вкажіть місце втрати",
        code: z.ZodIssueCode.custom,
      });
    }

    const isStrike = data.missionType === "Бойова";
    const isHit = data.hitOrLost === "Ураження";
    const isLost = data.hitOrLost === "Втрата";

    if (isStrike && isHit) {
      if (!data.hitTarget) {
        ctx.addIssue({
          path: ["targetHit"],
          message: "Обовʼязково для бойового ураження",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.ammoType) {
        ctx.addIssue({
          path: ["ammoType"],
          message: "Вкажіть тип БК",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (isLost || isHit) {
      if (!data.eventLocation) {
        ctx.addIssue({
          path: ["eventSettlement"],
          message: "Вкажіть населений пункт події",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.eventCoords) {
        ctx.addIssue({
          path: ["eventCoords"],
          message: "Вкажіть координати події",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

export type ReportFormValues = z.infer<typeof reportSchema>;

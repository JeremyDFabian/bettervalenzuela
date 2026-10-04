import { z } from 'astro/zod';
import { weekdays } from './hours';
import { iconNames } from './icons';

const ONE_DAY_MS = 86_400_000;
const httpUrl = z.url({ protocol: /^https?$/ });
const pastDate = z.coerce
  .date()
  .refine((date) => date.getTime() <= Date.now() + ONE_DAY_MS, 'Date cannot be in the future');
const text = z.string().trim().min(1);

export const sourceSchema = z.object({
  title: text,
  url: httpUrl,
  accessed: pastDate,
});

/** Fields every factual entry carries (spec §5.1). */
export const verifiableFields = {
  sources: z.array(sourceSchema).min(1),
  lastVerified: pastDate,
  status: z.enum(['verified', 'needs-review']),
};

export const serviceCategorySchema = z.object({
  name: text,
  description: text,
  icon: z.enum(iconNames),
  order: z.number().int().nonnegative(),
});

const clockTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:MM time');

/** Opening hours the "Open now" status is computed from (Asia/Manila time). */
export const scheduleSchema = z
  .object({
    days: z.array(z.enum(weekdays)).min(1),
    open: clockTime,
    close: clockTime,
  })
  .refine((slot) => slot.close > slot.open, 'Closing time must be after opening time');

export const officeSchema = z.object({
  name: text,
  head: text.optional(),
  location: text,
  phones: z.array(text).default([]),
  email: z.email().optional(),
  /** Hours as people read them; shown when the status script cannot run. */
  hours: text,
  schedule: z.array(scheduleSchema).default([]),
  ...verifiableFields,
});

const peso = z.number().nonnegative();

/** One fee line: a fixed amount, a range, or an amount set at assessment. */
export const feeSchema = z.union([
  z.object({ item: text, amount: peso }).strict(),
  z
    .object({ item: text, min: peso, max: peso })
    .strict()
    .refine((fee) => fee.min <= fee.max, 'min must not exceed max'),
  z.object({ item: text, varies: z.literal(true), basis: text }).strict(),
]);
export type Fee = z.infer<typeof feeSchema>;

/** Service fields except the references, which content.config.ts adds with reference(). */
export const serviceFields = {
  title: text,
  summary: text,
  whoCanApply: z.array(z.object({ condition: text, note: text.optional() })).min(1),
  requirements: z.array(text).min(1),
  steps: z.array(z.object({ title: text, detail: text, where: text.optional() })).min(1),
  fees: z.array(feeSchema).default([]),
  processingTime: text,
  officialLink: httpUrl.optional(),
  popular: z.boolean().default(false),
  ...verifiableFields,
};

export const hotlineCategories = [
  'emergency',
  'police',
  'fire',
  'medical',
  'disaster',
  'utility',
  'office',
] as const;
export type HotlineCategory = (typeof hotlineCategories)[number];

export const hotlinesSchema = z.object({
  entries: z
    .array(
      z.object({
        name: text,
        category: z.enum(hotlineCategories),
        numbers: z.array(text).min(1),
      }),
    )
    .min(1),
  ...verifiableFields,
});

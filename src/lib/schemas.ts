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
        /** One line under the name, such as "Main station · 24 hours". */
        note: text.optional(),
      }),
    )
    .min(1),
  ...verifiableFields,
});

/** A point inside a box around Valenzuela; catches swapped or mistyped coordinates. */
export const coordinatesSchema = z.object({
  lat: z.number().min(14.65).max(14.75),
  lng: z.number().min(120.92).max(121.02),
});

export const officialPositions = [
  'mayor',
  'vice-mayor',
  'representative',
  'councilor',
  'ex-officio',
] as const;
export type OfficialPosition = (typeof officialPositions)[number];

const district = z.union([z.literal(1), z.literal(2)]);

/** Official fields except `photo`, which content.config.ts adds with Astro's image() helper. */
export const officialFields = {
  name: text,
  position: z.enum(officialPositions),
  district: district.optional(),
  /** Title of an ex-officio member, e.g. "Liga ng mga Barangay President". */
  role: text.optional(),
  termStart: z.coerce.date(),
  termEnd: z.coerce.date(),
  contact: z.object({ phones: z.array(text).default([]), email: z.email().optional() }).optional(),
  ...verifiableFields,
};

type OfficialShape = {
  position: OfficialPosition;
  district?: 1 | 2 | undefined;
  role?: string | undefined;
  termStart: Date;
  termEnd: Date;
};

/** Cross-field rules for officials: term order, district only for representatives and councilors, a role for ex-officio. */
export function withOfficialRules<T extends z.ZodType<OfficialShape>>(schema: T) {
  return schema
    .refine((o) => o.termEnd > o.termStart, {
      message: 'termEnd must be after termStart',
      path: ['termEnd'],
    })
    .refine(
      (o) =>
        o.position === 'representative' || o.position === 'councilor'
          ? o.district !== undefined
          : o.district === undefined,
      {
        message: 'district is required for representatives and councilors, and only for them',
        path: ['district'],
      },
    )
    .refine((o) => o.position !== 'ex-officio' || o.role !== undefined, {
      message: 'ex-officio members need a role',
      path: ['role'],
    });
}

/** The official schema without a photo (used by tests). */
export const officialSchema = withOfficialRules(z.object(officialFields));

export const barangaySchema = z.object({
  name: text,
  district,
  hallAddress: text.optional(),
  phones: z.array(text).default([]),
  coordinates: coordinatesSchema.optional(),
  ...verifiableFields,
});

export const historySchema = z.object({
  timeline: z
    .array(
      z.object({
        year: z.number().int(),
        title: text,
        description: text,
        featured: z.boolean().default(false),
        sources: z.array(sourceSchema).min(1),
      }),
    )
    .min(1),
  ...verifiableFields,
});

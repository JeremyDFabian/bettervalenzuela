import { z } from 'astro/zod';
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

export const officeSchema = z.object({
  name: text,
  head: text.optional(),
  location: text,
  phones: z.array(text).default([]),
  email: z.email().optional(),
  hours: text,
  ...verifiableFields,
});

/** Service fields except the references, which content.config.ts adds with reference(). */
export const serviceFields = {
  title: text,
  summary: text,
  whoCanApply: text,
  requirements: z.array(text).min(1),
  steps: z.array(text).min(1),
  fees: z.array(z.object({ item: text, amount: z.number().nonnegative() })).default([]),
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

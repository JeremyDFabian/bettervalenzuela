import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  barangaySchema,
  historySchema,
  hotlinesSchema,
  officeSchema,
  officialFields,
  serviceCategorySchema,
  serviceFields,
  withOfficialRules,
} from './lib/schemas';

const yamlIn = (folder: string) => glob({ pattern: '**/*.yaml', base: `./src/content/${folder}` });

export const collections = {
  serviceCategories: defineCollection({
    loader: file('src/data/service-categories.json'),
    schema: serviceCategorySchema,
  }),
  offices: defineCollection({ loader: yamlIn('offices'), schema: officeSchema }),
  services: defineCollection({
    loader: yamlIn('services'),
    schema: z.object({
      ...serviceFields,
      category: reference('serviceCategories'),
      office: reference('offices'),
    }),
  }),
  hotlines: defineCollection({ loader: yamlIn('hotlines'), schema: hotlinesSchema }),
  officials: defineCollection({
    loader: yamlIn('officials'),
    schema: ({ image }) =>
      withOfficialRules(z.object({ ...officialFields, photo: image().optional() })),
  }),
  barangays: defineCollection({ loader: yamlIn('barangays'), schema: barangaySchema }),
  history: defineCollection({ loader: yamlIn('history'), schema: historySchema }),
};

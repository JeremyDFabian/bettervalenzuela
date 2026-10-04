import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { hotlinesSchema, officeSchema, serviceCategorySchema, serviceFields } from './lib/schemas';

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
};

import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default [
  { ignores: ['dist/', '.astro/', '.test-dist/', '.lighthouseci/', 'node_modules/'] },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
];

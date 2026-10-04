# BetterValenzuela

**A community-built, open-source city portal for Valenzuela City, Metro Manila.**

> **Status: 🟡 In development**

> [!NOTE]
> This is an independent, volunteer-run project. It is **not affiliated with, endorsed by, or an official channel of the City Government of Valenzuela.**

## Why

Information about city services is scattered across official pages, Facebook posts, and PDFs. Finding out where an office is, what a permit requires, or who to contact takes more effort than it should.

BetterValenzuela aims to put that in one fast, accessible, mobile-friendly place — city services, offices and contacts, requirements, and announcements — built in the open so anyone can correct it or improve it.

## Part of BetterGov.ph

This project is registered in the [BetterGov.ph LGU Directory](https://github.com/jmacj/better-lgu-directory), a community index of local government portals.

## Tech stack

- [Astro](https://astro.build) static site, TypeScript, plain CSS with design tokens
- Content as schema-validated YAML/JSON in `src/content/` and `src/data/`
- [Pagefind](https://pagefind.app) search, hosted on Cloudflare Pages
- No backend, no cookies, no tracking beyond cookieless Cloudflare Web Analytics

## Development

Requires Node 24 and pnpm 11.

```bash
pnpm install
pnpm dev          # http://localhost:4321 (search works only after a build)
pnpm test         # unit tests
pnpm test:build   # builds production and draft outputs and checks them
pnpm build        # production build + search index in dist/
```

Set `PUBLIC_SHOW_DRAFTS=true` to see entries marked `needs-review`. Production never shows them.

**Windows with Smart App Control:** Smart App Control blocks Astro's native compiler. Use the WebAssembly fallback by setting `NAPI_RS_FORCE_WASI=1` in your environment before running any `pnpm` command.

## Adding or correcting content

1. Edit or add a YAML file under `src/content/` and cite at least one source.
2. New or changed entries use `status: needs-review`. Check them in the pull request preview.
3. A reviewer confirms the entry against its sources, then sets `status: verified` and `lastVerified` to the date checked.

## Contributing

Contributions are welcome at any stage, including this one.

- **Ideas, corrections, and city data** — open an [issue](https://github.com/JeremyDFabian/bettervalenzuela/issues).
- **Code and content** — fork the repository and open a pull request.

## Data sources and attribution

City information published here will cite its source — the official Valenzuela City website, LGU publications, and public announcements. Sources will be listed in this section as content is added.

If you spot something inaccurate or out of date, please open an issue. Accuracy matters more than coverage.

## License

Code is released under the [MIT License](https://opensource.org/license/mit). Content (city information and page text) is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Maintainer

[@JeremyDFabian](https://github.com/JeremyDFabian)

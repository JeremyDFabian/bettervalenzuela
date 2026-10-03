const MAX_TITLE_LENGTH = 120;

/** Link to the "Report an error" issue form, pre-filled for one page. */
export function buildIssueUrl(repoUrl: string, page: { title: string; url: string }): string {
  const issueUrl = new URL(`${repoUrl.replace(/\/+$/, '')}/issues/new`);
  const title =
    page.title.length > MAX_TITLE_LENGTH
      ? `${page.title.slice(0, MAX_TITLE_LENGTH - 1)}…`
      : page.title;
  issueUrl.searchParams.set('template', 'report-error.yml');
  issueUrl.searchParams.set('title', `Error on: ${title}`);
  issueUrl.searchParams.set('page-url', page.url);
  return issueUrl.toString();
}

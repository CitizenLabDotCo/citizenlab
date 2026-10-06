import { Previewer } from 'pagedjs';

// A4 with room for the page number in the bottom margin.
//
// These rules have to live here rather than in the components. Paged.js decides
// where a page ends, and what goes in the margins, by reading the stylesheets it
// is handed as text; it never sees the classes styled-components writes into the
// document, so a rule declared there is silently ignored.
const PAGE_CSS = `
  @page {
    size: A4;
    margin: 16mm 14mm 18mm;

    /* Chrome implements no margin boxes at all — it drops this from the CSSOM
       before a script can read it. Paged.js implements them itself, and renders
       the box only for a rule that gives it something to say, so the number has
       to be declared rather than written in afterwards. */
    @bottom-center {
      content: counter(page);
      font-size: 9pt;
      color: #767676;
      vertical-align: middle;
    }
  }

  /* The cover carries no number. */
  @page :first {
    @bottom-center {
      content: none;
    }
  }

  .e2e-page-break {
    break-after: page;
    /* In the editor this is a dashed line saying where the page will end. Here
       the page really does end, so the marker itself has nothing left to say. */
    border: none !important;
    margin: 0 !important;
    height: 0;
    overflow: hidden;
  }

  .e2e-text-box,
  .e2e-custom-block,
  .e2e-toc-row {
    break-inside: avoid;
  }

  /* A tooltip is something you hover. On paper it is a stray white box sitting
     over the chart, so it never belongs in a page. */
  .recharts-tooltip-wrapper {
    display: none !important;
  }
`;

export interface PaginationResult {
  pageCount: number;
  // Heading text to the page it landed on, in document order. What the table of
  // contents is filled from.
  headings: { id: string; text: string; page: number }[];
}

const HEADING_SELECTOR = 'h1, h2, h3';

const pageStylesheetUrl = () =>
  URL.createObjectURL(new Blob([PAGE_CSS], { type: 'text/css' }));

// Writes each entry's page number into the contents list. This half stays in JS:
// which page a heading landed on is only knowable once the pages exist. The rows
// already exist and keep their size, so nothing reflows and the numbers stay true.
export const fillTableOfContents = (target: HTMLElement) => {
  const pages = [...target.querySelectorAll<HTMLElement>('.pagedjs_page')];
  const pageOfId = (id: string) => {
    const heading = target.querySelector(`#${CSS.escape(id)}`);
    if (!heading) return null;
    const page = pages.find((candidate) => candidate.contains(heading));
    return page ? page.dataset.pageNumber ?? null : null;
  };

  target.querySelectorAll<HTMLElement>('[data-toc-ref]').forEach((row) => {
    const cell = row.querySelector<HTMLElement>('.e2e-toc-page');
    const page = row.dataset.tocRef ? pageOfId(row.dataset.tocRef) : null;
    if (cell && page) cell.textContent = page;
  });
};

const readHeadings = (target: HTMLElement): PaginationResult['headings'] => {
  const pages = [...target.querySelectorAll<HTMLElement>('.pagedjs_page')];
  const pageOf = (element: Element) => {
    const page = pages.find((candidate) => candidate.contains(element));
    return page ? Number(page.dataset.pageNumber) : 0;
  };

  return [...target.querySelectorAll<HTMLElement>(HEADING_SELECTOR)]
    .map((heading) => ({
      id: heading.id,
      text: heading.textContent.trim(),
      page: pageOf(heading),
    }))
    .filter((heading) => heading.text !== '');
};

// Lays the report out as real pages: paged.js copies `source` into page-sized
// boxes inside `target`, in the same document, so every style the report already
// has keeps applying.
//
// What you see afterwards is what prints, because printing this DOM is what the
// browser does with it.
export const paginateReport = async (
  source: HTMLElement,
  target: HTMLElement
): Promise<PaginationResult> => {
  const stylesheetUrl = pageStylesheetUrl();

  try {
    target.innerHTML = '';
    await new Previewer().preview(source, [stylesheetUrl], target);
  } finally {
    URL.revokeObjectURL(stylesheetUrl);
  }

  fillTableOfContents(target);

  return {
    pageCount: target.querySelectorAll('.pagedjs_page').length,
    headings: readHeadings(target),
  };
};

import { fillTableOfContents } from './paginate';

// A stand-in for what paged.js leaves behind: pages that know their own number.
const buildPages = (pages: { number: number; html: string }[]) => {
  const target = document.createElement('div');
  target.innerHTML = pages
    .map(
      ({ number, html }) => `
        <div class="pagedjs_page" data-page-number="${number}">
          <div class="pagedjs_page_content">${html}</div>
        </div>`
    )
    .join('');
  document.body.appendChild(target);
  return target;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('fillTableOfContents', () => {
  const withContents = () =>
    buildPages([
      {
        number: 1,
        html: `
          <div class="e2e-toc-row" data-toc-ref="taking-part">
            <p>Taking part</p><p class="e2e-toc-page"></p>
          </div>
          <div class="e2e-toc-row" data-toc-ref="reach">
            <p>Reach</p><p class="e2e-toc-page"></p>
          </div>`,
      },
      { number: 4, html: '<h2 id="taking-part">Taking part</h2>' },
      { number: 7, html: '<h2 id="reach">Reach</h2>' },
    ]);

  it('writes the page each heading landed on', () => {
    const target = withContents();

    fillTableOfContents(target);

    const pages = [...target.querySelectorAll('.e2e-toc-page')].map(
      (cell) => cell.textContent
    );
    expect(pages).toEqual(['4', '7']);
  });

  it('leaves an entry blank when its heading is gone, rather than guessing', () => {
    const target = withContents();
    target.querySelector('#reach')?.remove();

    fillTableOfContents(target);

    const pages = [...target.querySelectorAll('.e2e-toc-page')].map(
      (cell) => cell.textContent
    );
    expect(pages).toEqual(['4', '']);
  });
});

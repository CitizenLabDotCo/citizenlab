import { act, renderHook } from 'utils/testUtils/rtl';

import useInfinitePagination from './useInfinitePagination';

type Page = { id: string };

// Stands in for an infinite query: `fetchNextPage` appends one page up to
// `totalPages`, then resolves with the pages it already has.
const createQuery = (loadedPages: number, totalPages: number) => {
  let pages: Page[] = Array.from({ length: loadedPages }, (_, index) => ({
    id: `page-${index + 1}`,
  }));

  const fetchNextPage = jest.fn(async () => {
    if (pages.length < totalPages) {
      pages = [...pages, { id: `page-${pages.length + 1}` }];
    }
    return { data: { pages, pageParams: [] } };
  });

  return { getPages: () => pages, fetchNextPage };
};

describe('useInfinitePagination', () => {
  it('starts on the first page', () => {
    const { fetchNextPage } = createQuery(1, 3);
    const { result } = renderHook(() =>
      useInfinitePagination<Page>({ pages: [{ id: 'page-1' }], fetchNextPage })
    );

    expect(result.current.currentPage).toBe(1);
  });

  it('goes to an already loaded page without fetching', async () => {
    const query = createQuery(3, 3);
    const { result } = renderHook(() =>
      useInfinitePagination<Page>({
        pages: query.getPages(),
        fetchNextPage: query.fetchNextPage,
      })
    );

    await act(() => result.current.goToPage(3));

    expect(result.current.currentPage).toBe(3);
    expect(query.fetchNextPage).not.toHaveBeenCalled();
  });

  it('fetches every page in between when jumping ahead', async () => {
    const query = createQuery(1, 4);
    const { result } = renderHook(() =>
      useInfinitePagination<Page>({
        pages: query.getPages(),
        fetchNextPage: query.fetchNextPage,
      })
    );

    await act(() => result.current.goToPage(4));

    expect(query.fetchNextPage).toHaveBeenCalledTimes(3);
    expect(result.current.currentPage).toBe(4);
  });

  it('stays on the current page when a page cannot be loaded', async () => {
    const query = createQuery(1, 2);
    const { result } = renderHook(() =>
      useInfinitePagination<Page>({
        pages: query.getPages(),
        fetchNextPage: query.fetchNextPage,
      })
    );

    await act(() => result.current.goToPage(5));

    expect(result.current.currentPage).toBe(1);
  });

  it('stays on the current page when the query has no pages yet', async () => {
    const { fetchNextPage } = createQuery(0, 0);
    const { result } = renderHook(() =>
      useInfinitePagination<Page>({ pages: undefined, fetchNextPage })
    );

    await act(() => result.current.goToPage(2));

    expect(result.current.currentPage).toBe(1);
  });
});

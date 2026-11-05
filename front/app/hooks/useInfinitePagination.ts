import { useState } from 'react';

import { InfiniteData } from '@tanstack/react-query';

interface Props<Page> {
  pages?: Page[];
  /** `fetchNextPage` of the infinite query the pages come from. */
  fetchNextPage: () => Promise<{ data?: InfiniteData<Page> }>;
}

/**
 * Drives numbered pagination on top of an infinite query, for lists that show
 * one page at a time instead of appending.
 */
const useInfinitePagination = <Page>({ pages, fetchNextPage }: Props<Page>) => {
  const [currentPage, setCurrentPage] = useState(1);

  const goToPage = async (page: number) => {
    // Infinite queries only ever append the next page, so jumping ahead has to
    // walk through every page in between before `pages[page - 1]` exists. The
    // current page stays on screen until the target page is there.
    let loadedPages = pages ?? [];

    while (loadedPages.length < page) {
      const { data } = await fetchNextPage();
      if (!data || data.pages.length === loadedPages.length) return;
      loadedPages = data.pages;
    }

    setCurrentPage(page);
  };

  return { currentPage, goToPage };
};

export default useInfinitePagination;

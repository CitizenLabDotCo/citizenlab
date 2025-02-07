import { PageCategorization, PageType } from '../typings';

const getVisiblePages = (
  uiSchema: PageCategorization,
  data: Record<string, any>,
  currentPage: PageType
) => {
  const visiblePages: PageType[] = [];
  const pages = uiSchema.elements;
  const currentPageIndex = pages.findIndex((page) => page === currentPage);

  // TODO???

  return visiblePages;
};

export default getVisiblePages;

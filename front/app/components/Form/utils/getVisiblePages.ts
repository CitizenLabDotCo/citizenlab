import { PageCategorization, PageType } from '../typings';

const getVisiblePages = (
  uiSchema: PageCategorization,
  data: Record<string, any>,
  currentlyVisiblePage: PageType
) => {
  const visiblePages: PageType[] = [];
  const pages = uiSchema.elements;
  const currentlyVisiblePageIndex = pages.findIndex(
    (page) => page === currentlyVisiblePage
  );

  // TODO???

  return visiblePages;
};

export default getVisiblePages;

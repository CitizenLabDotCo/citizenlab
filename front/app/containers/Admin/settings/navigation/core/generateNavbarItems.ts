import { TPagesState } from 'hooks/usePages';
import { TNavbarItemsState } from 'hooks/useNavbarItems';
import { INavbarItem } from 'services/navbar';
import { isNilOrError } from 'utils/helperUtils';

interface SplitNavbarItems {
  visibleNavbarItems: INavbarItem[];
  otherNavbarItems: INavbarItem[];
}

export default function generateNavbarItems(
  pages: TPagesState,
  navbarItems: TNavbarItemsState
): SplitNavbarItems | null {
  if (isNilOrError(pages) || isNilOrError(navbarItems)) return null;

  // Due to a bug in the navbar_items endpoint, we currently only get the visible navbar items.
  // So for now, we generate dummy data for the rest of the navbar items.
  // We will also filter out 'fixed' pages (anything already in policies)
  // We will also set their type to 'custom', since this is how non-fixed pages will behave.
  const otherNavbarItems: INavbarItem[] = pages
    .filter(isCustomPage)
    .map((page) => ({
      id: page.id,
      type: 'navbar_item',
      relationships: { page: { data: [{ id: page.id, type: 'page' }] } },
      attributes: {
        ordering: -1,
        visible: false,
        title_multiloc: page.attributes.title_multiloc,
        type: 'custom',
        created_at: '04-10-2021',
        updated_at: '04-10-2021',
      },
    }));

  return {
    visibleNavbarItems: navbarItems,
    otherNavbarItems,
  };
}

const isCustomPage = (page: IPageData) => {};

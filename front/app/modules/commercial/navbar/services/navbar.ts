import { Multiloc } from 'typings';
import streams from 'utils/streams';
import { apiEndpoint, INavbarItem } from 'services/navbar';

type TNavbarItemCode =
  | 'home'
  | 'projects'
  | 'proposals'
  | 'events'
  | 'all_input'
  | 'custom';

interface INavbarItemAdd {
  code: TNavbarItemCode;
  page_id?: string;
  title_multiloc?: Multiloc;
}

interface INavbarItemUpdate {
  title_multiloc?: Multiloc;
}

interface INavbarItemReorder {
  ordering: number;
}

export async function addNavbarItem(navbarItemAdd: INavbarItemAdd) {
  const { code, page_id, title_multiloc } = navbarItemAdd;

  if (code === 'custom') {
    if (!page_id) throw new Error("Pages with code 'custom' must have page_id");
    if (title_multiloc)
      throw new Error("Pages with code 'custom' cannot have title_multiloc");
  }

  if (code !== 'custom') {
    if (page_id)
      throw new Error(
        "Pages without code 'custom' do not have corresponding pages"
      );
    if (!title_multiloc)
      throw new Error("Pages without code 'custom' must have title_multiloc");
  }

  return streams.add<INavbarItem>(apiEndpoint, { nav_bar_item: navbarItemAdd });
}

export async function updateNavbarItem(
  navbarItemId: string,
  navbarItemUpdate: INavbarItemUpdate
) {
  return streams.update<INavbarItem>(
    `${apiEndpoint}/${navbarItemId}`,
    navbarItemId,
    { nav_bar_item: navbarItemUpdate }
  );
}

export async function reorderNavbarItem(
  navbarItemId: string,
  navbarItemReorder: INavbarItemReorder
) {
  return streams.update<INavbarItem>(
    `${apiEndpoint}/${navbarItemId}/reorder`,
    navbarItemId,
    { nav_bar_item: navbarItemReorder }
  );
}

export async function deleteNavbarItem(navbarItemId) {
  return streams.delete(`${apiEndpoint}/${navbarItemId}`, navbarItemId);
}

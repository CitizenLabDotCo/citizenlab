import { Multiloc } from 'typings';
import streams from 'utils/streams';
import { apiEndpoint, INavbarItem } from 'services/navbar';
import { IPageUpdate } from 'services/pages';

interface NavbarItemUpdate {
  title_multiloc?: Multiloc;
  visible?: boolean;
  ordering?: number;
  page?: IPageUpdate;
}

export function updateNavbarItem(
  navbarItemId: string,
  navbarItemUpdate: NavbarItemUpdate
) {
  return streams.update<INavbarItem>(
    `${apiEndpoint}/${navbarItemId}`,
    navbarItemId,
    navbarItemUpdate
  );
}

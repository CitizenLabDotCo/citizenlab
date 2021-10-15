import { Multiloc } from 'typings';
import streams from 'utils/streams';
import { apiEndpoint, INavbarItem } from 'services/navbar';
import { IPageUpdate } from 'services/pages';

interface INavbarItemUpdate {
  title_multiloc?: Multiloc;
  visible?: boolean;
  ordering?: number;
  page?: IPageUpdate;
}

export async function updateNavbarItem(
  navbarItemId: string,
  navbarItemUpdate: INavbarItemUpdate
) {
  const response = await streams.update<INavbarItem>(
    `${apiEndpoint}/${navbarItemId}`,
    navbarItemId,
    { navbar_item: navbarItemUpdate }
  );

  await streams.fetchAllWith({
    partialApiEndpoint: [apiEndpoint],
  });

  return response;
}

import streams from 'utils/streams';
import { apiEndpoint, IPage } from 'services/pages';
import { apiEndpoint as navbarEndpoint } from 'services/navbar';
import { Multiloc } from 'typings';

interface IPageCreate {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug?: string;
}

export interface IPageUpdate {
  title_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  slug?: string;
  nav_bar_item_attributes?: {
    title_multiloc?: Multiloc;
  };
}

export function createPage(pageData: IPageCreate) {
  return streams.add<IPage>(`${apiEndpoint}`, pageData);
}

export async function updatePage(pageId: string, pageData: IPageUpdate) {
  const response = await streams.update<IPage>(
    `${apiEndpoint}/${pageId}`,
    pageId,
    pageData
  );

  await streams.fetchAllWith({
    apiEndpoint: [navbarEndpoint],
  });

  return response;
}
export async function deletePage(pageId: string) {
  const response = await streams.delete(`${apiEndpoint}/${pageId}`, pageId);
  await streams.fetchAllWith({ apiEndpoint: [navbarEndpoint] });

  return response;
}

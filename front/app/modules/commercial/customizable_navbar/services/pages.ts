import streams from 'utils/streams';
import { apiEndpoint, IPage } from 'services/pages';
import { Multiloc } from 'typings';

export interface IPageUpdate {
  title_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  slug?: string;
  nav_bar_item_attributes: {
    title_multiloc?: Multiloc;
  };
}

export function updatePage(pageId: string, pageData: IPageUpdate) {
  return streams.update<IPage>(`${apiEndpoint}/${pageId}`, pageId, pageData);
}

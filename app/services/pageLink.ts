import { IRelationship, Multiloc } from 'typings.d';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';

const apiEndpoint = `${API_PATH}/page_links`;

export interface PageLink {
  type: 'page_links';
  id: string;
  attributes: {
    linked_page_slug: string;
    linked_page_title_multiloc: Multiloc;
    ordering: number;
  };
}

export function getPageLink(pageLinkId: string) {
  return streams.get<{data: PageLink}>({ apiEndpoint: `${apiEndpoint}/${pageLinkId}` });
}

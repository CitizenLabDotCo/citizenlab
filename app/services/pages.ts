import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/pages`;

export const LEGAL_PAGES = [
  'information',
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy'
];

export interface IPageData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    body_multiloc: Multiloc;
    slug: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    project: {
      data: IRelationship[];
    };
    page_links: {
      data: IRelationship[];
    };
  };
}

export interface PageLink {
  type: 'page_links';
  id: string;
  attributes: {
    linked_page_slug: string;
    linked_page_title_multiloc: Multiloc;
    ordering: number;
  };
}

export interface PageUpdate {
  title_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  slug?: string;
}

export interface IPage {
  data: IPageData;
}

export function listPages(streamParams: IStreamParams | null = null) {
  return streams.get<{data: IPageData[]}>({ apiEndpoint: `${apiEndpoint}`, ...streamParams });
}

export function pageBySlugStream(pageSlug: string, streamParams: IStreamParams | null = null) {
  return streams.get<IPage>({ apiEndpoint: `${apiEndpoint}/by_slug/${pageSlug}`, ...streamParams });
}

export function createPage(pageData: PageUpdate) {
  return streams.add<IPage>(`${apiEndpoint}`, pageData);
}

export function updatePage(pageId: string, pageData: PageUpdate) {
  return streams.update<IPage>(`${apiEndpoint}/${pageId}`, pageId, pageData);
}

export function deletePage(pageId: string) {
  return streams.delete(`${apiEndpoint}/${pageId}`, pageId);
}

export function pageByIdStream(pageId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IPage>({ apiEndpoint: `${apiEndpoint}/${pageId}`, ...streamParams });
}

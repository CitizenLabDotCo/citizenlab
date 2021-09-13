import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/pages`;

export const LEGAL_PAGES = [
  'information',
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
  'accessibility-statement',
  'faq',
];

export const LEGAL_PAGES_ALLOWED_TO_EDIT = [
  'information',
  'terms-and-conditions',
  'privacy-policy',
  'faq',
];

export type TPageSlug =
  // to be found in cl2-back: config/tenant_templates/base.yml
  | 'information'
  | 'cookie-policy'
  | 'privacy-policy'
  | 'terms-and-conditions'
  | 'accessibility-statement'
  | 'homepage-info'
  | 'faq'
  | 'initiatives'
  | 'initiatives-success-1'
  | 'initiatives-success-2'
  | 'initiatives-success-3'
  // if a custom page gets added, it can be different than the strings above
  | string;

export interface IPageData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    body_multiloc: Multiloc;
    slug: TPageSlug;
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
  // types needs to be updated. Both multilocs are required
  title_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  slug?: TPageSlug;
  publication_status?: 'draft' | 'published';
}

export interface IPage {
  data: IPageData;
}

export function listPages(streamParams: IStreamParams | null = null) {
  return streams.get<{ data: IPageData[] }>({
    apiEndpoint: `${apiEndpoint}`,
    ...streamParams,
  });
}

export function pageBySlugStream(
  pageSlug: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPage>({
    apiEndpoint: `${apiEndpoint}/by_slug/${pageSlug}`,
    ...streamParams,
  });
}

export async function createPage(pageData: PageUpdate) {
  const response = await streams.add<IPage>(`${apiEndpoint}`, pageData);

  return response;
}

export async function updatePage(pageId: string, pageData: PageUpdate) {
  const response = await streams.update<IPage>(
    `${apiEndpoint}/${pageId}`,
    pageId,
    pageData
  );

  return response;
}

export function deletePage(pageId: string) {
  return streams.delete(`${apiEndpoint}/${pageId}`, pageId);
}

export function pageByIdStream(
  pageId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPage>({
    apiEndpoint: `${apiEndpoint}/${pageId}`,
    ...streamParams,
  });
}

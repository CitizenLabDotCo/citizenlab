import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/pages`;

export type TFixedPage = 'information' | 'faq' | 'accessibility-statement';
export const FIXED_PAGES = ['information', 'faq', 'accessibility-statement'];
export const FIXED_PAGES_ALLOWED_TO_EDIT = ['information', 'faq'];

export type TPolicyPage =
  | 'terms-and-conditions'
  | 'privacy-policy'
  | 'cookie-policy';
export const POLICY_PAGES = [
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
];
export const POLICY_PAGES_ALLOWED_TO_EDIT = [
  'terms-and-conditions',
  'privacy-policy',
];

export type TFooterPage = TFixedPage | TPolicyPage;
export const FOOTER_PAGES = [
  'terms-and-conditions',
  'privacy-policy',
  'accessibility-statement',
  'cookie-policy',
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

interface IPageUpdate {
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

export async function createPage(pageData: IPageUpdate) {
  const response = await streams.add<IPage>(`${apiEndpoint}`, pageData);

  return response;
}

export async function updatePage(pageId: string, pageData: IPageUpdate) {
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

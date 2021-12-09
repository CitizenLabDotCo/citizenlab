import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { apiEndpoint as navbarItemApiEndpoint } from 'services/navbar';

export const apiEndpoint = `${API_PATH}/static_pages`;

// The following types all refer to the 'code' attribute of the page.

// The 'standard page' distinction is only relevant for non-commercial
// customers: they can edit the content of these pages, but nothing else.
// For commercial customers, these behave as 'custom' pages
type TStandardPage = 'about' | 'faq';

export const STANDARD_PAGES: TStandardPage[] = ['about', 'faq'];

// Policy pages of which only the content can be edited
// in 'policy' tab in settings (both for non-commercial and
// commercial customers)
type TPolicyPage = 'terms-and-conditions' | 'privacy-policy';

export const POLICY_PAGES: TPolicyPage[] = [
  'terms-and-conditions',
  'privacy-policy',
];

// Pages in the footer (confusingly, cookie-policy is not a policy page
// since it doesn't show up in the 'policies' tab)
export type TFooterPage =
  | TPolicyPage
  | 'cookie-policy'
  | 'accessibility-statement';

export const FOOTER_PAGES: TFooterPage[] = [
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
  'accessibility-statement',
];

// Pages that do not have a corresponding navbar item
export type TFixedPage = TFooterPage | 'proposals';

export const FIXED_PAGES: TFixedPage[] = [
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
  'accessibility-statement',
  'proposals',
];

export type TPageCode = TStandardPage | TFixedPage | 'custom';

type TPublicationStatus = 'draft' | 'published';

export interface IPageData {
  id: string;
  type: 'static_page';
  attributes: {
    title_multiloc: Multiloc;
    body_multiloc: Multiloc;
    nav_bar_item_title_multiloc: Multiloc;
    code: TPageCode;
    slug: string;
    publication_status: TPublicationStatus;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    navbar_item: {
      data: IRelationship | null;
    };
  };
}

interface IPageCreate {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug?: string;
}

export interface IPageUpdate {
  title_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  slug?: string;
  publication_status?: TPublicationStatus;
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

export function createPage(pageData: IPageCreate) {
  return streams.add<IPage>(`${apiEndpoint}`, pageData);
}

export function updatePage(pageId: string, pageData: IPageUpdate) {
  return streams.update<IPage>(`${apiEndpoint}/${pageId}`, pageId, pageData);
}

export async function deletePage(pageId: string) {
  const response = await streams.delete(`${apiEndpoint}/${pageId}`, pageId);
  await streams.fetchAllWith({ apiEndpoint: [navbarItemApiEndpoint] });

  return response;
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

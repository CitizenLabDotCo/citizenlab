import { IRelationship, Multiloc } from 'typings.d';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';

const apiEndpoint = `${API_PATH}/pages`;

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
      data: IRelationship[]
    }
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

export function listPages(streamParams: IStreamParams<{data: IPageData[]}> | null = null) {
  return streams.get<{data: IPageData[]}>({ apiEndpoint: `${apiEndpoint}`, ...streamParams });
}

export function pageBySlugStream(pageSlug: string, streamParams: IStreamParams<IPage> | null = null) {
  return streams.get<IPage>({ apiEndpoint: `${apiEndpoint}/by_slug/${pageSlug}`, ...streamParams });
}

export function createPage(pageData: PageUpdate) {
  return streams.add<IPage>(`${apiEndpoint}`, pageData);
}

export function updatePage(pageId: string, pageData: PageUpdate) {
  return streams.update<IPage>(`${apiEndpoint}/${pageId}`, pageId, pageData);
}

export function pageByIdStream(pageId: string, streamParams: IStreamParams<IPage> | null = null) {
  return streams.get<IPage>({ apiEndpoint: `${apiEndpoint}/${pageId}`, ...streamParams });
}

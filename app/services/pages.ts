import { IRelationship, Multiloc } from 'typings.d';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';

const apiEndpoint = `${API_PATH}/pages`;

export interface IPageData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: {
      [key: string]: string;
    };
    body_multiloc: {
      [key: string]: string;
    };
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

export interface IPage {
  data: IPageData;
}

export function pageBySlugStream(pageSlug: string, streamParams: IStreamParams<IPage> | null = null) {
  return streams.get<IPage>({ apiEndpoint: `${apiEndpoint}/by_slug/${pageSlug}`, ...streamParams });
}

export function pageByIdStream(pageId: string, streamParams: IStreamParams<IPage> | null = null) {
  return streams.get<IPage>({ apiEndpoint: `${apiEndpoint}/${pageId}`, ...streamParams });
}

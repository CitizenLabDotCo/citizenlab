import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc, IRelationship } from 'typings';

const apiEndpoint = `${API_PATH}/areas`;

export interface IAreasQueryParams {
  'page[number]'?: number;
  'page[size]'?: number;
  for_homepage_filter?: boolean;
}

export interface IAreaData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    ordering: number;
    static_page_ids: string[];
  };
  relationships: {
    static_pages: {
      data: IRelationship[];
    };
  };
}

export interface IAreaLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IAreas {
  data: IAreaData[];
  links: IAreaLinks;
}

export interface IArea {
  data: IAreaData;
}

export function deleteArea(areaId: string) {
  return streams.delete(`${apiEndpoint}/${areaId}`, areaId);
}

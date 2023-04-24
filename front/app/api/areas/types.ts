import { ILinks, IRelationship, Multiloc } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import areasKeys from './keys';

export type AreasKeys = Keys<typeof areasKeys>;

export interface IAreasQueryParams {
  pageNumber?: number;
  pageSize?: number;
  forHomepageFilter?: boolean;
  includeStaticPages?: boolean;
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

export interface IAreas {
  data: IAreaData[];
  links: ILinks;
}

export interface IArea {
  data: IAreaData;
}

export interface IAreaAdd {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export interface IAreaUpdate {
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  ordering?: number;
}

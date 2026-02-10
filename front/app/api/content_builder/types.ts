import { CraftJson } from 'components/admin/ContentBuilder/typings';

import { Keys } from 'utils/cl-react-query/types';

import contentBuilderKeys from './keys';

export type ContentBuilderKeys = Keys<typeof contentBuilderKeys>;

export interface IContentBuilderData {
  type: 'content_builder_layout';
  id: string;
  attributes: {
    craftjs_json: CraftJson;
    code: string;
    enabled: boolean;
  };
}

export interface IContentBuilderLayout {
  data: IContentBuilderData;
}

export interface IAddContentBuilderLayout {
  contentBuildableType: ContentBuildableType;
  contentBuildableId: string;
  craftjs_json?: CraftJson;
  enabled?: boolean;
}

export type ContentBuildableType = 'project' | 'folder' | 'homepage';

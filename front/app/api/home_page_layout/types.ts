import { Keys } from 'utils/cl-react-query/types';
import { CraftJson } from 'components/admin/ContentBuilder/typings';
import homepageBuilderKeys from './keys';

export type HomepageBuilderKeys = Keys<typeof homepageBuilderKeys>;

export interface IHomepageBuilderData {
  type: 'content_builder_layout';
  id: string;
  attributes: {
    craftjs_json: CraftJson;
    code: string;
    enabled: boolean;
  };
}

export interface IHomepageBuilderLayout {
  data: IHomepageBuilderData;
}

export interface IAddHomepageBuilderLayout {
  craftjs_json?: CraftJson;
  enabled?: boolean;
}

import { CraftJson } from 'components/admin/ContentBuilder/typings';

import { Keys } from 'utils/cl-react-query/types';

import projectDescriptionBuilderKeys from './keys';

export type ProjectDescriptionBuilderKeys = Keys<
  typeof projectDescriptionBuilderKeys
>;

export interface IProjectDescriptionBuilderData {
  type: 'content_builder_layout';
  id: string;
  attributes: {
    craftjs_json: CraftJson;
    code: string;
    enabled: boolean;
  };
}

export interface IProjectDescriptionBuilderLayout {
  data: IProjectDescriptionBuilderData;
}

export interface IAddProjectDescriptionBuilderLayout {
  projectId: string;
  craftjs_json?: CraftJson;
  enabled?: boolean;
}

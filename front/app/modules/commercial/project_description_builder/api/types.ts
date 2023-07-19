import { Keys } from 'utils/cl-react-query/types';
import { JsonMultiloc } from 'components/admin/ContentBuilder/typings';
import projectDescriptionBuilderKeys from './keys';

export type ProjectDescriptionBuilderKeys = Keys<
  typeof projectDescriptionBuilderKeys
>;

export interface IProjectDescriptionBuilderData {
  type: 'content_builder_layout';
  id: string;
  attributes: {
    craftjs_jsonmultiloc: JsonMultiloc;
    code: string;
    enabled: boolean;
  };
}

export interface IProjectDescriptionBuilderLayout {
  data: IProjectDescriptionBuilderData;
}

export interface IAddProjectDescriptionBuilderLayout {
  projectId: string;
  craftjs_jsonmultiloc?: JsonMultiloc;
  enabled?: boolean;
}

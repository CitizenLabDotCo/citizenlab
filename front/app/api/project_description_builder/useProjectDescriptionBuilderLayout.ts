import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectDescriptionBuilderKeys from './keys';
import {
  IProjectDescriptionBuilderLayout,
  ProjectDescriptionBuilderKeys,
  ProjectDescriptionModelType,
} from './types';

const fetchProjectDescriptionBuilderLayout = (
  modelId: string,
  modelType: ProjectDescriptionModelType
) => {
  return fetcher<IProjectDescriptionBuilderLayout>({
    path:
      modelType === 'folder'
        ? `/project_folders/${modelId}/content_builder_layouts/project_folder_description`
        : `/projects/${modelId}/content_builder_layouts/project_description`,
    action: 'get',
  });
};

const useProjectDescriptionBuilderLayout = (
  modelId: string,
  modelType: ProjectDescriptionModelType = 'project'
) => {
  return useQuery<
    IProjectDescriptionBuilderLayout,
    CLErrors,
    IProjectDescriptionBuilderLayout,
    ProjectDescriptionBuilderKeys
  >({
    queryKey: projectDescriptionBuilderKeys.item({ modelId }),
    queryFn: () => fetchProjectDescriptionBuilderLayout(modelId, modelType),
    // enabled: !!project && project.data.attributes.uses_content_builder,
  });
};

export default useProjectDescriptionBuilderLayout;

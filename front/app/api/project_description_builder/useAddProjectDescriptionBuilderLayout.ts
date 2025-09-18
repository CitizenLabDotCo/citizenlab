import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import projectsKeys from 'api/projects/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import projectDescriptionBuilderKeys from './keys';
import {
  IProjectDescriptionBuilderLayout,
  IAddProjectDescriptionBuilderLayout,
} from './types';

const addProjectDescriptionBuilderLayout = async ({
  modelId,
  modelType = 'project',
  craftjs_json,
  enabled,
}: IAddProjectDescriptionBuilderLayout) =>
  fetcher<IProjectDescriptionBuilderLayout>({
    path:
      modelType === 'folder'
        ? `/project_folders/${modelId}/content_builder_layouts/project_folder_description/upsert`
        : `/projects/${modelId}/content_builder_layouts/project_description/upsert`,
    action: 'post',
    body: { content_builder_layout: { craftjs_json, enabled } },
  });

const useAddProjectDescriptionBuilderLayout = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IProjectDescriptionBuilderLayout,
    CLErrors,
    IAddProjectDescriptionBuilderLayout
  >({
    mutationFn: addProjectDescriptionBuilderLayout,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectDescriptionBuilderKeys.item({
          modelId: variables.modelId,
        }),
      });

      // We invalidate the project if `enabled` changes because the `uses_content_builder` attribute will also change on the project
      if (Object.prototype.hasOwnProperty.call(variables, 'enabled')) {
        queryClient.invalidateQueries({
          queryKey: projectsKeys.item({ id: variables.modelId }),
        });
      }
    },
  });
};

export default useAddProjectDescriptionBuilderLayout;

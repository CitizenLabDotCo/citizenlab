import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import projectsKeys from 'api/projects/keys';
import foldersKeys from 'api/project_folders/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import contentBuilderKeys from './keys';
import { IContentBuilderLayout, IAddContentBuilderLayout } from './types';

const addContentBuilderLayout = async ({
  modelId,
  modelType,
  craftjs_json,
  enabled,
}: IAddContentBuilderLayout) =>
  fetcher<IContentBuilderLayout>({
    path:
      modelType === 'folder'
        ? `/project_folders/${modelId}/content_builder_layouts/project_folder_description/upsert`
        : `/projects/${modelId}/content_builder_layouts/project_description/upsert`,
    action: 'post',
    body: { content_builder_layout: { craftjs_json, enabled } },
  });

const useAddContentBuilderLayout = () => {
  const queryClient = useQueryClient();
  return useMutation<IContentBuilderLayout, CLErrors, IAddContentBuilderLayout>(
    {
      mutationFn: addContentBuilderLayout,
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: contentBuilderKeys.item({
            modelId: variables.modelId,
          }),
        });

        // We invalidate the project or folder if `enabled` changes
        // because the `uses_content_builder` attribute will also change on the model
        if (Object.prototype.hasOwnProperty.call(variables, 'enabled')) {
          queryClient.invalidateQueries({
            queryKey:
              variables.modelType === 'folder'
                ? foldersKeys.item({ id: variables.modelId })
                : projectsKeys.item({ id: variables.modelId }),
          });
        }
      },
    }
  );
};

export default useAddContentBuilderLayout;

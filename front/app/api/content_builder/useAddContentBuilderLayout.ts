import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import foldersKeys from 'api/project_folders/keys';
import projectsKeys from 'api/projects/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import contentBuilderKeys from './keys';
import { IContentBuilderLayout, IAddContentBuilderLayout } from './types';
import { contentBuilderlayoutPath } from './useContentBuilderLayout';

const addContentBuilderLayout = async ({
  contentBuildableType,
  contentBuildableId,
  craftjs_json,
  enabled = true,
}: IAddContentBuilderLayout) =>
  fetcher<IContentBuilderLayout>({
    path: `${contentBuilderlayoutPath(
      contentBuildableType,
      contentBuildableId
    )}/upsert` as `/${string}`,
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
            contentBuildableId: variables.contentBuildableId,
          }),
        });

        // We invalidate the project or folder if `enabled` changes
        // because the `uses_content_builder` attribute will also change on the model
        if (Object.prototype.hasOwnProperty.call(variables, 'enabled')) {
          const type = variables.contentBuildableType;
          if (type !== 'homepage') {
            queryClient.invalidateQueries({
              queryKey:
                type === 'folder'
                  ? foldersKeys.item({ id: variables.contentBuildableId })
                  : projectsKeys.item({ id: variables.contentBuildableId }),
            });
          }
        }
      },
    }
  );
};

export default useAddContentBuilderLayout;

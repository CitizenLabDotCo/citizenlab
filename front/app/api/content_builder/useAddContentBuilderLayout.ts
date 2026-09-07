import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fileAttachmentsKeys from 'api/file_attachments/keys';
import foldersKeys from 'api/project_folders/keys';

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
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: contentBuilderKeys.item({
            contentBuildableId: variables.contentBuildableId,
          }),
        });

        // Invalidate file attachments cache for this specific layout
        queryClient.invalidateQueries({
          queryKey: fileAttachmentsKeys.list({
            attachable_id: data.data.id,
            attachable_type: 'ContentBuilder::Layout',
          }),
        });

        // We invalidate the folder if `enabled` changes
        // because the `uses_content_builder` attribute will also change on the model
        if (
          variables.contentBuildableType === 'folder' &&
          Object.prototype.hasOwnProperty.call(variables, 'enabled')
        ) {
          queryClient.invalidateQueries({
            queryKey: foldersKeys.item({ id: variables.contentBuildableId }),
          });
        }
      },
    }
  );
};

export default useAddContentBuilderLayout;

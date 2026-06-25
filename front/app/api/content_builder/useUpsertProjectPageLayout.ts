import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fileAttachmentsKeys from 'api/file_attachments/keys';
import projectsKeys from 'api/projects/keys';

import { CraftJson } from 'components/admin/ContentBuilder/typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IContentBuilderLayout } from './types';
import {
  projectPageLayoutKeys,
  projectPageLayoutPath,
} from './useProjectPageLayout';

interface IUpsertProjectPageLayout {
  projectId: string;
  craftjs_json?: CraftJson;
  enabled?: boolean;
}

const upsertProjectPageLayout = ({
  projectId,
  craftjs_json,
  enabled = true,
}: IUpsertProjectPageLayout) =>
  fetcher<IContentBuilderLayout>({
    path: `${projectPageLayoutPath(projectId)}/upsert` as `/${string}`,
    action: 'post',
    body: { content_builder_layout: { craftjs_json, enabled } },
  });

const useUpsertProjectPageLayout = () => {
  const queryClient = useQueryClient();
  return useMutation<IContentBuilderLayout, CLErrors, IUpsertProjectPageLayout>(
    {
      mutationFn: upsertProjectPageLayout,
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: projectPageLayoutKeys.item(variables.projectId),
        });

        // Invalidate file attachments cache for this specific layout
        queryClient.invalidateQueries({
          queryKey: fileAttachmentsKeys.list({
            attachable_id: data.data.id,
            attachable_type: 'ContentBuilder::Layout',
          }),
        });

        // `uses_content_builder` on the project changes with `enabled`
        if (Object.prototype.hasOwnProperty.call(variables, 'enabled')) {
          queryClient.invalidateQueries({
            queryKey: projectsKeys.item({ id: variables.projectId }),
          });
        }
      },
    }
  );
};

export default useUpsertProjectPageLayout;

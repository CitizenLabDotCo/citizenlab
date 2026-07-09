import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IContentBuilderLayout } from 'api/content_builder/types';
import fileAttachmentsKeys from 'api/file_attachments/keys';
import projectsKeys from 'api/projects/keys';

import { CraftJson } from 'components/admin/ContentBuilder/typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectPageLayoutKeys from './keys';

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
    path: `/projects/${projectId}/content_builder_layouts/project_page/upsert`,
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
          queryKey: projectPageLayoutKeys.item({
            projectId: variables.projectId,
          }),
        });

        queryClient.invalidateQueries({
          queryKey: fileAttachmentsKeys.list({
            attachable_id: data.data.id,
            attachable_type: 'ContentBuilder::Layout',
          }),
        });

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

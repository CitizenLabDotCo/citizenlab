import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IContentBuilderLayout } from 'api/content_builder/types';
import fileAttachmentsKeys from 'api/file_attachments/keys';

import { CraftJson } from 'components/admin/ContentBuilder/typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customPageLayoutKeys from './keys';

interface IUpsertCustomPageLayout {
  staticPageId: string;
  craftjs_json?: CraftJson;
}

const upsertCustomPageLayout = ({
  staticPageId,
  craftjs_json,
}: IUpsertCustomPageLayout) =>
  fetcher<IContentBuilderLayout>({
    path: `/static_pages/${staticPageId}/content_builder_layouts/custom_page/upsert`,
    action: 'post',
    // A layout is only ever upserted to be shown; nothing disables one through this hook.
    body: { content_builder_layout: { craftjs_json, enabled: true } },
  });

const useUpsertCustomPageLayout = () => {
  const queryClient = useQueryClient();
  return useMutation<IContentBuilderLayout, CLErrors, IUpsertCustomPageLayout>({
    mutationFn: upsertCustomPageLayout,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: customPageLayoutKeys.item({
          staticPageId: variables.staticPageId,
        }),
      });

      queryClient.invalidateQueries({
        queryKey: fileAttachmentsKeys.list({
          attachable_id: data.data.id,
          attachable_type: 'ContentBuilder::Layout',
        }),
      });
    },
  });
};

export default useUpsertCustomPageLayout;

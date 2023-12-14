import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import homepageLayoutKeys from './keys';
import { IHomepageBuilderLayout, IAddHomepageBuilderLayout } from './types';

const addHomepageBuilderLayout = async ({
  craftjs_json,
  enabled,
}: IAddHomepageBuilderLayout) =>
  fetcher<IHomepageBuilderLayout>({
    path: `/home_pages/content_builder_layouts/homepage/upsert`,
    action: 'post',
    body: { content_builder_layout: { craftjs_json, enabled } },
  });

const useAddHomepageBuilderLayout = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IHomepageBuilderLayout,
    CLErrors,
    IAddHomepageBuilderLayout
  >({
    mutationFn: addHomepageBuilderLayout,
    onSuccess: (_data) => {
      queryClient.invalidateQueries({
        queryKey: homepageLayoutKeys.items(),
      });
    },
  });
};

export default useAddHomepageBuilderLayout;

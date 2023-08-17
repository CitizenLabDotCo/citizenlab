import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Locale } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IIdeas } from 'api/ideas/types';
import { importedIdeasKeys } from './keys';

interface RequestParams {
  project_id: string;
  file: string;
  locale: Locale;
}

const addOfflineIdeas = async (requestParams: RequestParams) =>
  fetcher<IIdeas>({
    path: `/projects/${requestParams.project_id}/import_ideas/bulk_create`,
    action: 'post',
    body: { import_ideas: { pdf: requestParams.file } },
  });

const useAddOfflineIdeas = () => {
  const queryClient = useQueryClient();

  return useMutation<IIdeas, CLErrors, RequestParams>({
    mutationFn: addOfflineIdeas,
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({
        queryKey: importedIdeasKeys.list({ projectId: params.project_id }),
      });
    },
  });
};

export default useAddOfflineIdeas;

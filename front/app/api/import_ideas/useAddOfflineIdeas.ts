import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, Locale } from 'typings';

import { IIdeas } from 'api/ideas/types';

import fetcher from 'utils/cl-react-query/fetcher';

import { importedIdeasKeys } from './keys';

interface RequestParams {
  phase_id: string;
  pdf: string;
  locale: Locale;
  personal_data: boolean;
}

const addOfflineIdeas = async ({
  phase_id,
  pdf,
  locale,
  personal_data,
}: RequestParams) =>
  fetcher<IIdeas>({
    path: `/phases/${phase_id}/import_ideas/bulk_create`,
    action: 'post',
    body: { import_ideas: { pdf, locale, personal_data } },
  });

const useAddOfflineIdeas = () => {
  const queryClient = useQueryClient();

  return useMutation<IIdeas, CLErrors, RequestParams>({
    mutationFn: addOfflineIdeas,
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({
        queryKey: importedIdeasKeys.list({ phaseId: params.phase_id }),
      });
    },
  });
};

export default useAddOfflineIdeas;

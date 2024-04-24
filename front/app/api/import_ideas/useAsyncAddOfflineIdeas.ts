import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, ILinks, SupportedLocale } from 'typings';

import { IJobData } from 'api/jobs/types';

import fetcher from 'utils/cl-react-query/fetcher';

import { importedIdeasKeys } from './keys';

interface RequestParams {
  phase_id: string;
  file: string;
  format: string;
  locale: SupportedLocale;
  personal_data: boolean;
}

interface JobIdResponse {
  data: IJobData[];
  links: ILinks;
}

const addOfflineIdeas = async ({
  phase_id,
  file,
  format,
  locale,
  personal_data,
}: RequestParams): Promise<JobIdResponse> =>
  fetcher<JobIdResponse>({
    path: `/phases/${phase_id}/importer/bulk_create/idea/${format}`,
    action: 'post',
    body: { import: { file, locale, personal_data } },
  });

const useAsyncAddOfflineIdeas = () => {
  const queryClient = useQueryClient();

  return useMutation<JobIdResponse, CLErrors, RequestParams>({
    mutationFn: addOfflineIdeas,
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({
        queryKey: importedIdeasKeys.list({ phaseId: params.phase_id }),
      });
    },
  });
};

export default useAsyncAddOfflineIdeas;

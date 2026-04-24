import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, ILinks, SupportedLocale } from 'typings';

import { IBackgroundJobData } from 'api/background_jobs/types';

import fetcher from 'utils/cl-react-query/fetcher';

import { importedIdeasKeys } from './keys';

interface RequestParams {
  phase_id: string;
  file: string;
  format: string;
  locale: SupportedLocale;
  pages_per_form?: number;
}

interface JobIdResponse {
  data: IBackgroundJobData[];
  links: ILinks;
}

const addOfflineIdeas = async ({
  phase_id,
  file,
  format,
  locale,
  pages_per_form,
}: RequestParams): Promise<JobIdResponse> =>
  fetcher<JobIdResponse>({
    path: `/phases/${phase_id}/importer/bulk_create_async/idea/${format}`,
    action: 'post',
    body: { import: { file, locale, pages_per_form } },
  });

const useAddOfflineIdeasAsync = () => {
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

export default useAddOfflineIdeasAsync;

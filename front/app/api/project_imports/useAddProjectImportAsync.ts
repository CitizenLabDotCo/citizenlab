import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors, ILinks, SupportedLocale } from 'typings';

import { IBackgroundJobData } from 'api/background_jobs/types';

import fetcher from 'utils/cl-react-query/fetcher';

import projectImportKeys from './keys';

interface RequestParams {
  file: string;
  locale: SupportedLocale;
}

interface JobIdResponse {
  data: IBackgroundJobData[];
  links: ILinks;
}

const addProjectImport = async ({
  file,
  locale,
}: RequestParams): Promise<JobIdResponse> =>
  fetcher<JobIdResponse>({
    path: `/importer/bulk_create_async/projects/`,
    action: 'post',
    body: { import: { file, locale } },
  });

const useAddProjectImportAsync = () => {
  const queryClient = useQueryClient();

  return useMutation<JobIdResponse, CLErrors, RequestParams>({
    mutationFn: addProjectImport,
    onSuccess: (_) => {
      queryClient.invalidateQueries({
        queryKey: projectImportKeys.list({}),
      });
    },
  });
};

export default useAddProjectImportAsync;

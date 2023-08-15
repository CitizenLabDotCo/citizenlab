import { useMutation } from '@tanstack/react-query';
import { CLErrors, Locale } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IIdeas } from 'api/ideas/types';

interface RequestParams {
  project_id: string;
  file: string;
  locale: Locale;
}

const addOfflineIdeas = async (requestParams: RequestParams) =>
  fetcher<IIdeas>({
    path: `/import_ideas/${requestParams.project_id}/bulk_create_pdf`,
    action: 'post',
    body: { import_ideas: { pdf: requestParams.file } },
  });

const useAddOfflineIdeas = () => {
  return useMutation<IIdeas, CLErrors, RequestParams>({
    mutationFn: addOfflineIdeas,
  });
};

export default useAddOfflineIdeas;

import { useMutation } from '@tanstack/react-query';
import { CLErrors, Locale } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IIdeas } from 'api/ideas/types';

interface RequestParams {
  project_id: string;
  file: string;
  locale: Locale;
}

const addHandwrittenIdeas = async (requestParams: RequestParams) =>
  fetcher<IIdeas>({
    path: `/projects/${requestParams.project_id}/import_ideas/bulk_create`,
    action: 'post',
    body: { import_ideas: { pdf: requestParams.file } },
  });

const useAddHandwrittenIdeas = () => {
  return useMutation<IIdeas, CLErrors, RequestParams>({
    mutationFn: addHandwrittenIdeas,
  });
};

export default useAddHandwrittenIdeas;

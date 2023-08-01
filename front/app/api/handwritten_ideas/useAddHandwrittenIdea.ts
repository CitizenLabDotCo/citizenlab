import { useMutation } from '@tanstack/react-query';
import { CLErrors, Locale } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IIdea } from 'api/ideas/types';

interface RequestBody {
  idea: {
    project_id: string;
    image: string;
    locale: Locale;
  };
}

const addHandwrittenIdea = async (requestBody: RequestBody) =>
  fetcher<IIdea>({
    path: `/handwritten_ideas`,
    action: 'post',
    body: requestBody,
  });

const useAddHandwrittenIdea = () => {
  return useMutation<IIdea, CLErrors, RequestBody>({
    mutationFn: addHandwrittenIdea,
  });
};

export default useAddHandwrittenIdea;

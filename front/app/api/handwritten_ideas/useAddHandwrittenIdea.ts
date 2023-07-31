import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';

interface RequestBody {
  file: {
    file: string;
  };
}

const addHandwrittenIdea = async (requestBody: RequestBody) =>
  fetcher<any>({
    path: `/handwritten_ideas`,
    action: 'post',
    body: requestBody,
  });

const useAddHandwrittenIdea = () => {
  return useMutation<any, CLErrors, RequestBody>({
    mutationFn: addHandwrittenIdea,
    onSuccess: (data) => {
      console.log(data);
    },
  });
};

export default useAddHandwrittenIdea;

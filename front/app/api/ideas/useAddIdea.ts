import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasKeys from './keys';
import { IIdea, IIdeaAdd } from './types';

const addIdea = async (requestBody: IIdeaAdd) =>
  fetcher<IIdea>({
    path: `/ideas`,
    action: 'post',
    body: requestBody,
  });

const useAddIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdea, CLErrors, IIdeaAdd>({
    mutationFn: addIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ideasKeys.lists(),
      });
    },
  });
};

export default useAddIdea;

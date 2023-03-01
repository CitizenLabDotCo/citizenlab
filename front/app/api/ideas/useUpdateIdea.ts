import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasKeys from './keys';
import { IIdea, IIdeaUpdate } from './types';

type IUpdateIdeaObject = {
  id: string;
  requestBody: IIdeaUpdate;
};

const updateIdea = ({ id, requestBody }: IUpdateIdeaObject) =>
  fetcher<IIdea>({
    path: `/ideas/${id}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateIdeaStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdea, CLErrors, IUpdateIdeaObject>({
    mutationFn: updateIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
    },
  });
};

export default useUpdateIdeaStatus;

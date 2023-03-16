import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_PATH } from 'containers/App/constants';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
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
    body: { idea: requestBody },
  });

const useUpdateIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdea, CLErrors, IUpdateIdeaObject>({
    mutationFn: updateIdea,
    onSuccess: (idea) => {
      queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
      streams.fetchAllWith({
        dataId: [idea.data.relationships.project.data.id],
        apiEndpoint: [`${API_PATH}/stats/ideas_count`, `${API_PATH}/analytics`],
        partialApiEndpoint: [`${API_PATH}/ideas/${idea.data.id}/images`],
      });
    },
  });
};

export default useUpdateIdea;

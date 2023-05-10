import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import groupKeys from './keys';
import { IGroup, IGroupUpdate } from './types';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

const updateGroup = ({ id, ...requestBody }: IGroupUpdate) =>
  fetcher<IGroup>({
    path: `/groups/${id}`,
    action: 'patch',
    body: { group: requestBody },
  });

const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<IGroup, CLErrors, IGroupUpdate>({
    mutationFn: updateGroup,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users`],
        onlyFetchActiveStreams: true,
      });
    },
  });
};

export default useUpdateGroup;

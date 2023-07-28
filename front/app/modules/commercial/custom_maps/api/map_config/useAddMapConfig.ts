import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IMapConfig, IMapConfigAttributes } from './types';
import mapConfigKeys from './keys';

type IMapConfigAdd = {
  projectId: string;
} & IMapConfigAttributes;

const addConfig = async ({ projectId, ...map_config }: IMapConfigAdd) =>
  fetcher<IMapConfig>({
    path: `/projects/${projectId}/map_config`,
    action: 'post',
    body: { map_config },
  });

const useAddMapConfig = () => {
  const queryClient = useQueryClient();
  return useMutation<IMapConfig, CLErrors, IMapConfigAdd>({
    mutationFn: addConfig,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mapConfigKeys.item({ projectId: variables.projectId }),
      });
    },
  });
};

export default useAddMapConfig;

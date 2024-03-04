import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IMapConfig, IMapConfigAttributes } from './types';
import mapConfigKeys from './keys';

type IMapConfigUpdate = {
  projectId: string;
  id: string;
} & IMapConfigAttributes;

const updateMapConfig = ({ projectId, ...map_config }: IMapConfigUpdate) =>
  fetcher<IMapConfig>({
    path: `/projects/${projectId}/map_config`,
    action: 'patch',
    body: { map_config },
  });

const useUpdateMapConfig = () => {
  const queryClient = useQueryClient();
  return useMutation<IMapConfig, CLErrors, IMapConfigUpdate>({
    mutationFn: updateMapConfig,
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mapConfigKeys.item({ projectId: variables.projectId }),
      });
    },
  });
};

export default useUpdateMapConfig;

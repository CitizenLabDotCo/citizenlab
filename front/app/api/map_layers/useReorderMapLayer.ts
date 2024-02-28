import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IMapLayer } from './types';
import mapConfigKeys from '../map_config/keys';

type IReorderMapLayer = {
  id: string;
  projectId: string;
  ordering: number;
};

const reorderMapLayer = ({ id, projectId, ordering }: IReorderMapLayer) =>
  fetcher<IMapLayer>({
    path: `/projects/${projectId}/map_config/layers/${id}/reorder`,
    action: 'patch',
    body: { layer: { ordering } },
  });

const useReorderMapLayer = () => {
  const queryClient = useQueryClient();
  return useMutation<IMapLayer, CLErrors, IReorderMapLayer>({
    mutationFn: reorderMapLayer,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mapConfigKeys.item({ projectId: variables.projectId }),
      });
    },
  });
};

export default useReorderMapLayer;

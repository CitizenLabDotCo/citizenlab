import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import mapConfigKeys from '../map_config/keys';

const deleteMapLayer = ({
  id,
  mapConfigId,
}: {
  id: string;
  mapConfigId: string;
}) =>
  fetcher({
    path: `/map_configs/${mapConfigId}/layers/${id}`,
    action: 'delete',
  });

const useDeleteMapLayer = (projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMapLayer,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mapConfigKeys.item({ id: variables.mapConfigId }),
      });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: mapConfigKeys.item({ projectId }),
        });
      }
    },
  });
};

export default useDeleteMapLayer;

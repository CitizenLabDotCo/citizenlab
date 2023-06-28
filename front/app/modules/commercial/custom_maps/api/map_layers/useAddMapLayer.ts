import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IMapLayer, IMapLayerAttributes } from './types';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

type IMapLayerAdd = {
  projectId: string;
} & IMapLayerAttributes;

const addLayer = async ({ projectId, ...layer }: IMapLayerAdd) =>
  fetcher<IMapLayer>({
    path: `/projects/${projectId}/map_config/layers`,
    action: 'post',
    body: { layer },
  });

const useAddMapLayer = () => {
  return useMutation<IMapLayer, CLErrors, IMapLayerAdd>({
    mutationFn: addLayer,
    onSuccess: async (_data, variables) => {
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/projects/${variables.projectId}/map_config`],
      });
    },
  });
};

export default useAddMapLayer;

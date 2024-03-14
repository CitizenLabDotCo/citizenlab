import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IMapConfig, IMapConfigAttributes } from './types';

const addConfig = async (requestBody: IMapConfigAttributes) =>
  fetcher<IMapConfig>({
    path: `/map_configs`,
    action: 'post',
    body: { map_config: { requestBody } },
  });

const useAddMapConfig = () => {
  return useMutation<IMapConfig, CLErrors, IMapConfigAttributes>({
    mutationFn: addConfig,
  });
};

export default useAddMapConfig;

import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IMapConfig } from './types';

export const duplicateConfig = async (id: string) =>
  fetcher<IMapConfig>({
    path: `/map_configs/${id}/duplicate_map_config_and_layers`,
    action: 'post',
    body: {},
  });

const useDuplicateMapConfig = () => {
  return useMutation<IMapConfig, CLErrors, string>({
    mutationFn: duplicateConfig,
  });
};

export default useDuplicateMapConfig;

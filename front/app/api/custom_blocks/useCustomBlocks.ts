import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customBlocksKeys from './keys';
import { CustomBlocksKeys, ICustomBlocks, ICustomBlocksParams } from './types';

const fetchCustomBlocks = (params: ICustomBlocksParams) =>
  fetcher<ICustomBlocks>({
    path: '/custom_blocks',
    action: 'get',
    queryParams: params,
  });

const useCustomBlocks = (params: ICustomBlocksParams = {}) => {
  return useQuery<ICustomBlocks, CLErrors, ICustomBlocks, CustomBlocksKeys>({
    queryKey: customBlocksKeys.list(params),
    queryFn: () => fetchCustomBlocks(params),
  });
};

export default useCustomBlocks;

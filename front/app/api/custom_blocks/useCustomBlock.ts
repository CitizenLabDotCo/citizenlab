import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customBlocksKeys from './keys';
import { CustomBlocksKeys, ICustomBlock } from './types';

const fetchCustomBlock = ({ id }: { id?: string }) =>
  fetcher<ICustomBlock>({ path: `/custom_blocks/${id}`, action: 'get' });

const useCustomBlock = (id?: string) => {
  return useQuery<ICustomBlock, CLErrors, ICustomBlock, CustomBlocksKeys>({
    queryKey: customBlocksKeys.item({ id }),
    queryFn: () => fetchCustomBlock({ id }),
    enabled: !!id,
  });
};

export default useCustomBlock;

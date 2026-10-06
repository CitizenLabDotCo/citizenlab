import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customBlocksKeys from './keys';
import { CustomBlocksKeys, ICustomBlocks } from './types';

const fetchCustomBlocks = () =>
  fetcher<ICustomBlocks>({ path: '/custom_blocks', action: 'get' });

// The published blocks an admin can place by hand, each with the version a new
// placement pins. The toolbox is the only reader: a placed block never asks what the
// newest version is, it renders the one its node holds.
const useCustomBlocks = ({ enabled }: { enabled: boolean }) =>
  useQuery<ICustomBlocks, CLErrors, ICustomBlocks, CustomBlocksKeys>({
    queryKey: customBlocksKeys.lists(),
    queryFn: fetchCustomBlocks,
    enabled,
  });

export default useCustomBlocks;

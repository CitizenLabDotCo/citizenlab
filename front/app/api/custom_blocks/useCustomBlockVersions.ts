import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customBlocksKeys from './keys';
import { ICustomBlockVersions } from './types';

const fetchVersions = (blockId: string) =>
  fetcher<ICustomBlockVersions>({
    path: `/custom_blocks/${blockId}/versions`,
    action: 'get',
  });

// Admin-only, and the only way to read a version's source. The block endpoint
// deliberately withholds it.
const useCustomBlockVersions = (blockId?: string, { enabled = true } = {}) =>
  useQuery<ICustomBlockVersions, CLErrors>({
    queryKey: customBlocksKeys.list({ versionsOf: blockId }),
    queryFn: () => fetchVersions(blockId as string),
    enabled: enabled && !!blockId,
  });

export default useCustomBlockVersions;

import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customBlocksKeys from './keys';
import {
  CustomBlocksKeys,
  ICustomBlockVersion,
  ICustomBlockVersionParams,
} from './types';

const fetchCustomBlockVersion = ({
  blockId,
  version,
}: ICustomBlockVersionParams) =>
  fetcher<ICustomBlockVersion>({
    path: `/custom_blocks/${blockId}/versions/${version}`,
    action: 'get',
  });

/**
 * Reads the exact version a layout pinned.
 *
 * There is deliberately no hook for "the block's current version". The layout
 * node holds `{ blockId, version }`, and that pin is what decides what renders:
 * regenerating a block, or upgrading it to a new SDK, must not change a report
 * someone has already read and approved.
 */
const useCustomBlockVersion = ({
  blockId,
  version,
}: ICustomBlockVersionParams) =>
  useQuery<
    ICustomBlockVersion,
    CLErrors,
    ICustomBlockVersion,
    CustomBlocksKeys
  >({
    queryKey: customBlocksKeys.item({ blockId, version }),
    queryFn: () => fetchCustomBlockVersion({ blockId, version }),
    enabled: !!blockId && !!version,
  });

export default useCustomBlockVersion;

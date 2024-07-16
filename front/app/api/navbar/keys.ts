import { QueryKeys } from 'utils/cl-react-query/types';

import { NavbarParameters } from './types';

const baseKey = { type: 'nav_bar_item' };

const navbarKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: NavbarParameters) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default navbarKeys;

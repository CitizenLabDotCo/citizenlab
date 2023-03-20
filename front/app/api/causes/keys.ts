import { ICauseParameters } from './types';

const causesKeys = {
  all: () => [{ type: 'cause' }],
  lists: () => [{ ...causesKeys.all()[0], operation: 'list' }],
  list: (params: ICauseParameters) => [
    { ...causesKeys.all()[0], operation: 'list', ...params },
  ],
  items: () => [{ ...causesKeys.all()[0], operation: 'item' }],
  item: (id: string) => [
    {
      ...causesKeys.items()[0],
      id,
    },
  ],
};

export default causesKeys;

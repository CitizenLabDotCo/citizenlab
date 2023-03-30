import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'idea_vote',
  variant: 'idea',
};

const ideaVotesKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default ideaVotesKeys;

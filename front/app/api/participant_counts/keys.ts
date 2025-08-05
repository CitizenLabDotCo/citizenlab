import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'participant_counts' };

const moderationsCountKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: { project_ids: string[] }) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default moderationsCountKeys;

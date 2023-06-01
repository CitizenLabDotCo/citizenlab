import { IParticipationContextType } from 'typings';
import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'responses_count' };

const pollReponsesKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({
    participationContextId,
    participationContextType,
  }: {
    participationContextId: string;
    participationContextType: IParticipationContextType;
  }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { participationContextId, participationContextType },
    },
  ],
} satisfies QueryKeys;

export default pollReponsesKeys;

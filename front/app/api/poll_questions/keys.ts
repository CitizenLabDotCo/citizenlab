import { IParticipationContextType } from 'typings';
import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'question' };

const pollQuestionsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({
    participationContextId,
    participationContextType,
  }: {
    participationContextId: string;
    participationContextType: IParticipationContextType;
  }) => [
    {
      ...baseKey,
      operation: 'list',
      parameters: { participationContextId, participationContextType },
    },
  ],
} satisfies QueryKeys;

export default pollQuestionsKeys;

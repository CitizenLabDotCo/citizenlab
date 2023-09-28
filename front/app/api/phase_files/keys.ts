import { Keys, QueryKeys } from 'utils/cl-react-query/types';
import phaseFilesKeys from './keys';

export type PhaseFilesKeys = Keys<typeof phaseFilesKeys>;

const baseKey = {
  type: 'file',
  variant: 'phase',
};

const PhaseFilesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ phaseId }: { phaseId: string | null }) => [
    { ...baseKey, operation: 'list', parameters: { phaseId } },
  ],
} satisfies QueryKeys;

export default PhaseFilesKeys;

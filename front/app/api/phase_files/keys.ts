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
  list: ({ phaseId }: { phaseId: string }) => [
    { ...baseKey, operation: 'list', parameters: { phaseId } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ phaseId, fileId }: { phaseId: string; fileId: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { phaseId, fileId },
    },
  ],
} satisfies QueryKeys;

export default PhaseFilesKeys;

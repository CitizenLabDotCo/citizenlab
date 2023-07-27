import { QueryKeys } from 'utils/cl-react-query/types';
import { IMachineTranslationParams } from './types';

const baseKey = { type: 'machine_translation' };

const machineTranslationKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: Partial<IMachineTranslationParams>) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default machineTranslationKeys;

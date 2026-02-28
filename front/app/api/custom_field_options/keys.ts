import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'custom_field_option' };

type ListParams = {
  customFieldId?: string;
};

const customFieldOptionsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: ListParams) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ optionId }: { optionId?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id: optionId } },
  ],
} satisfies QueryKeys;

export default customFieldOptionsKeys;

import { QueryKeys } from 'utils/cl-react-query/types';
import { InputParameters } from './types';

const baseKey = { type: 'attendance' };

const eventsAttendancesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: InputParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ eventAttendanceId }: { eventAttendanceId?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { eventAttendanceId },
    },
  ],
} satisfies QueryKeys;

export default eventsAttendancesKeys;

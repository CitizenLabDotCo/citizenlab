import { PhasePermissionsProps } from './usePhasePermissions';

const eventsKeys = {
  all: () => [{ type: 'events' }],
  lists: () => [{ ...eventsKeys.all()[0], operation: 'list' }],
  list: ({ phaseId }: PhasePermissionsProps) => [
    { ...eventsKeys.lists()[0], phaseId },
  ],
} as const;

export default eventsKeys;

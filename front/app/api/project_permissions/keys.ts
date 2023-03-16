import { ProjectPermissionsProps } from './useProjectPermissions';

const eventsKeys = {
  all: () => [{ type: 'events' }],
  lists: () => [{ ...eventsKeys.all()[0], operation: 'list' }],
  list: ({ projectId }: ProjectPermissionsProps) => [
    { ...eventsKeys.lists()[0], projectId },
  ],
} as const;

export default eventsKeys;

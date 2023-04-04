import { PhasePermissionsProps } from './usePhasePermissions';

const phasePermissionKeys = {
  all: () => [{ type: 'permission', variant: 'phase' }],
  lists: () => [{ ...phasePermissionKeys.all()[0], operation: 'list' }],
  list: ({ phaseId }: PhasePermissionsProps) => [
    { ...phasePermissionKeys.lists()[0], phaseId },
  ],
} as const;

export default phasePermissionKeys;

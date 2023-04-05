import { QueryKeys } from 'utils/cl-react-query/types';
import { PhasePermissionsProps } from './usePhasePermissions';

const phasePermissionKeys = {
  all: () => [{ type: 'permission', variant: 'phase' }],
  lists: () => [{ ...phasePermissionKeys.all()[0], operation: 'list' }],
  list: ({ phaseId }: PhasePermissionsProps) => [
    { ...phasePermissionKeys.lists()[0], phaseId },
  ],
} satisfies QueryKeys;

export default phasePermissionKeys;

import { QueryKeys } from 'utils/cl-react-query/types';
import { PhasePermissionsProps } from './usePhasePermissions';

const baseKey = { type: 'permission', variant: 'phase' };

const phasePermissionKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: PhasePermissionsProps) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
} satisfies QueryKeys;

export default phasePermissionKeys;

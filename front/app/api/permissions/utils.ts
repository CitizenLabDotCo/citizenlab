import {
  Action,
  IGlobalPermissionAction,
  IPhasePermissionAction,
} from './types';

const GLOBAL_ACTIONS: IGlobalPermissionAction[] = ['following', 'visiting'];

export const isPhasePermissionAction = (
  action: Action
): action is IPhasePermissionAction =>
  !GLOBAL_ACTIONS.some((globalAction) => globalAction === action);

import { IGlobalPermissionAction, Action } from './types';

const GLOBAL_PERMISSION_ACTIONS = new Set<Action>([
  'reacting_initiative',
  'commenting_initiative',
  'posting_initiative',
  'following',
] satisfies IGlobalPermissionAction[]);

export const isGlobalPermissionAction = (
  action: Action
): action is IGlobalPermissionAction => {
  return GLOBAL_PERMISSION_ACTIONS.has(action);
};

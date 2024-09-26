import { IInitiativeAction } from './types';

const INITIATIVE_ACTIONS: Set<IInitiativeAction> = new Set([
  'posting_initiative',
  'commenting_initiative',
  'reacting_initiative',
]);

export const isInitiativeAction = (action: string) => {
  return INITIATIVE_ACTIONS.has(action as any);
};

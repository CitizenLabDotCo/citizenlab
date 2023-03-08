import { IInitiativeAction } from 'services/initiatives';
import { IPCAction } from 'typings';

export type InitiativeContext = {
  type: 'initiative';
  action: IInitiativeAction;
};

export type ProjectContext = {
  type: 'project' | 'phase';
  action: IPCAction;
  id: string /* project or phase id, depending on type attribute */;
};

export type AuthenticationContext = InitiativeContext | ProjectContext;

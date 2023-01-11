import { IInitiativeAction } from 'services/initiatives';
import { IParticipationContextType, IPCAction } from 'typings';
import eventEmitter from 'utils/eventEmitter';

// search for verification_error in back to find these
type BosaFasVerificationError = 'taken' | 'no_token_passed';
type ClaveUnicaVerificationError = 'taken' | 'no_token_passed';
type OmniAuthVerificationError = 'taken' | 'no_token_passed' | 'not_entitled';

export type IVerificationError =
  | BosaFasVerificationError
  | ClaveUnicaVerificationError
  | OmniAuthVerificationError;

export type ProjectContext = {
  id: string;
  type: IParticipationContextType;
  action: IPCAction;
};

export type TVerificationStep =
  | 'method-selection'
  | 'method-step'
  | 'success'
  | 'error'
  | null;

export type InitiativeContext = {
  type: 'initiative';
  action: IInitiativeAction;
};

export type ContextShape =
  | ProjectContext
  | InitiativeContext
  | null
  | undefined;

export interface OpenVerificationModalData {
  step: TVerificationStep;
  context: ContextShape | null;
  error?: IVerificationError | null;
}

export enum VerificationModalEvents {
  open = 'openVerificationModal',
  close = 'closeVerificationModal',
}

interface IOpenVerificationModalParams {
  context?: ContextShape;
  step?: TVerificationStep;
  error?: IVerificationError | null;
}
export function isProjectContext(obj: ContextShape): obj is ProjectContext {
  return (obj as ProjectContext)?.id !== undefined;
}

export function openVerificationModal(params?: IOpenVerificationModalParams) {
  eventEmitter.emit<OpenVerificationModalData>(VerificationModalEvents.open, {
    step: params?.step || 'method-selection',
    context: params?.context || null,
  });
}

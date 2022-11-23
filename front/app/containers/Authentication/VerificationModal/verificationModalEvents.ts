import { IInitiativeAction } from 'services/initiatives';
import { IParticipationContextType, IPCAction } from 'typings';
import eventEmitter from 'utils/eventEmitter';

export type IVerificationError = 'taken' | 'not_entitled' | null;

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

export function closeVerificationModal() {
  eventEmitter.emit(VerificationModalEvents.close);
}

export const openVerificationModal$ =
  eventEmitter.observeEvent<OpenVerificationModalData>(
    VerificationModalEvents.open
  );

export const closeVerificationModal$ = eventEmitter.observeEvent(
  VerificationModalEvents.close
);

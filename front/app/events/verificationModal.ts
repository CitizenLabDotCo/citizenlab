import { AuthenticationContext, ProjectContext } from 'api/permissions/types';
import eventEmitter from 'utils/eventEmitter';

// search for verification_error in back to find these
type BosaFasVerificationError = 'taken' | 'no_token_passed';
type ClaveUnicaVerificationError = 'taken' | 'no_token_passed';
type OmniAuthVerificationError = 'taken' | 'no_token_passed' | 'not_entitled';

export type IVerificationError =
  | BosaFasVerificationError
  | ClaveUnicaVerificationError
  | OmniAuthVerificationError;

export function isVerificationError(
  error: string
): error is IVerificationError {
  return (
    isBosaFasVerificationError(error) ||
    isClaveUnicaVerificationError(error) ||
    isOmniAuthVerificationError(error)
  );
}

function isBosaFasVerificationError(
  error: string
): error is BosaFasVerificationError {
  return error === 'taken' || error === 'no_token_passed';
}

function isClaveUnicaVerificationError(
  error: string
): error is ClaveUnicaVerificationError {
  return error === 'taken' || error === 'no_token_passed';
}

function isOmniAuthVerificationError(
  error: string
): error is OmniAuthVerificationError {
  return (
    error === 'taken' || error === 'no_token_passed' || error === 'not_entitled'
  );
}

export type TVerificationStep =
  | 'method-selection'
  | 'method-step'
  | 'success'
  | 'error'
  | null;

export interface OpenVerificationModalData {
  step: TVerificationStep;
  context: AuthenticationContext | null;
  error?: IVerificationError | null;
}

export enum VerificationModalEvents {
  open = 'openVerificationModal',
  close = 'closeVerificationModal',
}

interface IOpenVerificationModalParams {
  context?: AuthenticationContext;
  step?: TVerificationStep;
  error?: IVerificationError | null;
}
export function isProjectContext(
  obj?: AuthenticationContext
): obj is ProjectContext {
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

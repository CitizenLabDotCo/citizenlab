import {
  AuthenticationContext,
  PhaseContext,
} from 'api/authentication/authentication_requirements/types';

// search for verification_error in back to find these
// type BosaFasVerificationError = 'taken' | 'no_token_passed';
// type ClaveUnicaVerificationError = 'taken' | 'no_token_passed';
// type OmniAuthVerificationError = 'taken' | 'no_token_passed' | 'not_entitled';

// export type IVerificationError =
//   | BosaFasVerificationError
//   | ClaveUnicaVerificationError
//   | OmniAuthVerificationError;

// export function isVerificationError(
//   error: string
// ): error is IVerificationError {
//   return (
//     isBosaFasVerificationError(error) ||
//     isClaveUnicaVerificationError(error) ||
//     isOmniAuthVerificationError(error)
//   );
// }

// function isBosaFasVerificationError(
//   error: string
// ): error is BosaFasVerificationError {
//   return error === 'taken' || error === 'no_token_passed';
// }

// function isClaveUnicaVerificationError(
//   error: string
// ): error is ClaveUnicaVerificationError {
//   return error === 'taken' || error === 'no_token_passed';
// }

// function isOmniAuthVerificationError(
//   error: string
// ): error is OmniAuthVerificationError {
//   return (
//     error === 'taken' || error === 'no_token_passed' || error === 'not_entitled'
//   );
// }

export type TVerificationStep =
  | 'method-selection'
  | 'method-step'
  | 'success'
  | 'error'
  | null;

export function isProjectContext(
  obj?: AuthenticationContext
): obj is PhaseContext {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return (obj as PhaseContext)?.id !== undefined;
}

import eventEmitter from 'utils/eventEmitter';
import { VerificationModalSteps } from 'components/VerificationModal/VerificationModal';

/* might open is fired when a user attempts to achieve an action they need to sign up for
 * it sets a flag on the apps state.
 * When the flag is up,
 * and the user is not signed in, navigating to any page but sign-up or complete sign up removes the flag
 * and the user is signed in, navigating from any page but sign up or complete sign up removes the flag
 -> leaving the signup flow, whether signed or unsigned, removes the flag.
 * The only case where the flag is stil up when loading a page is
 * when the user is redirected from the signup flow to the page he attempted to perform the action.
 * When accessing action requires verification, we fire verification verificationNeeded
 * when the might open flag is still up, it opens the modal, when the might open flag is not up nothing happens
*/

export enum VerificationModalEvents {
  // used to signal an action that might need verification was used by unsigned user
  mightOpen = 'mightOpenVerificationModal',
  // used to signal an action displayed on this page required verifiction
  verificationNeeded = 'verificationNeeded',
  open = 'openVerificationModal',
  close = 'closeVerificationModal'
}

export interface OpenVerificationModalData {
  step: VerificationModalSteps;
  withContext?: boolean;
}

export function setMightOpenVerificationModal(location: string) {
  eventEmitter.emit(
    location,
    VerificationModalEvents.mightOpen,
    null
  );
}

export function verificationNeeded(location: string) {
  eventEmitter.emit<OpenVerificationModalData>(
    location,
    VerificationModalEvents.verificationNeeded,
    { step: 'method-selection', withContext: true }
  );
}

export function openVerificationModalWithContext(location: string) {
  eventEmitter.emit<OpenVerificationModalData>(
    location,
    VerificationModalEvents.open,
    { step: 'method-selection', withContext: true }
  );
}

export function openVerificationModalWithoutContext(location: string) {
  eventEmitter.emit<OpenVerificationModalData>(
    location,
    VerificationModalEvents.open,
    { step: 'method-selection', withContext: false }
  );
}

export function closeVerificationModal(location: string) {
  eventEmitter.emit(
    location,
    VerificationModalEvents.close,
    null
  );
}
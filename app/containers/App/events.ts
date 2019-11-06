import eventEmitter from 'utils/eventEmitter';
import { VerificationModalSteps } from 'components/VerificationModal/VerificationModal';

/* might open is fired when a user attempts to achieve an action they need to sign up for
 * it sets a flag on the apps state.
 * when the user leaves the registration flow with signinp up, we remove that flag and nothing happens.
 * if the user does sign up and an action requires verification, we fire verification verificationNeeded
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

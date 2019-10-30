import eventEmitter from 'utils/eventEmitter';
import { VerificationModalSteps } from 'components/VerificationModal/VerificationModal';

export enum VerificationModalEvents {
  open = 'openVerificationModal',
  close = 'closeVerificationModal'
}

export interface OpenVerificationModalData {
  step: VerificationModalSteps;
  withContext?: boolean;
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

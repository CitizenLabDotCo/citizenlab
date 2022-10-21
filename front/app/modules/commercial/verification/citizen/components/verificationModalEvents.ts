import {
  OpenVerificationModalData,
  VerificationModalEvents,
} from 'components/Verification/verificationModalEvents';
import eventEmitter from 'utils/eventEmitter';

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

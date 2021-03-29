import eventEmitter from 'utils/eventEmitter';
import {
  VerificationModalEvents,
  OpenVerificationModalData,
} from 'components/Verification/VerificationModalEvents';

export function closeVerificationModal() {
  eventEmitter.emit(VerificationModalEvents.close);
}

export const openVerificationModal$ = eventEmitter.observeEvent<
  OpenVerificationModalData
>(VerificationModalEvents.open);

export const closeVerificationModal$ = eventEmitter.observeEvent(
  VerificationModalEvents.close
);

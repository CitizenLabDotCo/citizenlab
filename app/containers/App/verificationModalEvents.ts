import eventEmitter from 'utils/eventEmitter';
import { ContextShape, VerificationModalSteps } from 'components/VerificationModal/VerificationModal';
import { IParticipationContextType, ICitizenAction } from 'typings';

export interface OpenVerificationModalData {
  step: VerificationModalSteps;
  context: ContextShape | null;
}

enum VerificationModalEvents {
  open = 'openVerificationModal',
  close = 'closeVerificationModal'
}

export function openVerificationModalWithContext(location: string, participationContextId: string, participationContextType: IParticipationContextType, action: ICitizenAction) {
  eventEmitter.emit<OpenVerificationModalData>(
    location,
    VerificationModalEvents.open,
    { step: 'method-selection', context: { action, id: participationContextId, type: participationContextType } }
  );
}

export function openVerificationModalWithoutContext(location: string) {
  eventEmitter.emit<OpenVerificationModalData>(
    location,
    VerificationModalEvents.open,
    { step: 'method-selection', context: null }
  );
}

export function closeVerificationModal(location: string) {
  eventEmitter.emit(
    location,
    VerificationModalEvents.close,
    null
  );
}

export const openVerificationModal$ = eventEmitter.observeEvent<OpenVerificationModalData>(VerificationModalEvents.open);

export const closeVerificationModal$ = eventEmitter.observeEvent(VerificationModalEvents.close);

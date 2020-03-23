import eventEmitter from 'utils/eventEmitter';
import { ContextShape, TVerificationSteps } from 'components/Verification/VerificationSteps';
import { IParticipationContextType, ICitizenAction } from 'typings';

export interface OpenVerificationModalData {
  step: TVerificationSteps;
  context: ContextShape | null;
}

enum VerificationModalEvents {
  open = 'openVerificationModal',
  close = 'closeVerificationModal'
}

export function openVerificationModalWithContext(participationContextId: string, participationContextType: IParticipationContextType, action: ICitizenAction) {
  eventEmitter.emit<OpenVerificationModalData>(VerificationModalEvents.open, {
    step: 'method-selection',
    context: {
      action,
      id: participationContextId,
      type: participationContextType
    }
  });
}

export function openVerificationModalWithoutContext() {
  eventEmitter.emit<OpenVerificationModalData>(VerificationModalEvents.open, {
    step: 'method-selection',
    context: null
  });
}

export function closeVerificationModal() {
  eventEmitter.emit(VerificationModalEvents.close);
}

export const openVerificationModal$ = eventEmitter.observeEvent<OpenVerificationModalData>(VerificationModalEvents.open);

export const closeVerificationModal$ = eventEmitter.observeEvent(VerificationModalEvents.close);

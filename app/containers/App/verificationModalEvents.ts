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

export function openVerificationModalWithContext(source: string, participationContextId: string, participationContextType: IParticipationContextType, action: ICitizenAction) {
  eventEmitter.emit<OpenVerificationModalData>(
    source,
    VerificationModalEvents.open,
    {
      step: 'method-selection',
      context: {
        action,
        id: participationContextId,
        type: participationContextType
      }
    }
  );
}

export function openVerificationModalWithoutContext(source: string) {
  eventEmitter.emit<OpenVerificationModalData>(
    source,
    VerificationModalEvents.open,
    {
      step: 'method-selection',
      context: null
    }
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

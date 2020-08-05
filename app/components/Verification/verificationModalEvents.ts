import eventEmitter from 'utils/eventEmitter';
import {
  ContextShape,
  TVerificationSteps,
} from 'components/Verification/VerificationSteps';

export interface OpenVerificationModalData {
  step: TVerificationSteps;
  context: ContextShape | null;
}

enum VerificationModalEvents {
  open = 'openVerificationModal',
  close = 'closeVerificationModal',
}

interface IOpenVerificationModalParams {
  context?: ContextShape;
  step?: TVerificationSteps;
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

export const openVerificationModal$ = eventEmitter.observeEvent<
  OpenVerificationModalData
>(VerificationModalEvents.open);

export const closeVerificationModal$ = eventEmitter.observeEvent(
  VerificationModalEvents.close
);

import eventEmitter from 'utils/eventEmitter';
import {
  TVerificationSteps,
  ContextShape,
  IVerificationError,
} from './VerificationModal';

export interface OpenVerificationModalData {
  step: TVerificationSteps;
  context: ContextShape | null;
  error?: IVerificationError | null;
}

enum VerificationModalEvents {
  open = 'openVerificationModal',
  close = 'closeVerificationModal',
}

interface IOpenVerificationModalParams {
  context?: ContextShape;
  step?: TVerificationSteps;
  error?: IVerificationError | null;
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

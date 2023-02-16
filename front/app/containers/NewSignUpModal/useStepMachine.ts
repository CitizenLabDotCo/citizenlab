import { useCallback } from 'react';
import { useMachine } from '@xstate/react';
import stepMachine, { States, Step } from './stepMachine';

export default function useStepMachine() {
  const [state, _send] = useMachine(stepMachine);
  const currentStep = state.value as Step;

  const send = useCallback(
    // @ts-ignore
    <S extends Step, E extends keyof States[S]['on']>(_: S, event: E): void => {
      _send(event as any);
    },
    [_send]
  );

  return {
    currentStep,
    send,
  };
}

export type Send = ReturnType<typeof useStepMachine>['send'];

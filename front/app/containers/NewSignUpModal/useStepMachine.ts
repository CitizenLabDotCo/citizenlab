import { useState, useCallback } from 'react';
import {
  getNextStep,
  Step,
  Steps,
  State,
  GetRequirements,
} from './stepService';

export default function useStepMachine() {
  const [currentStep, setCurrentStep] = useState<Step>('inactive');
  const [state, setState] = useState<State>({
    status: 'ok',
    error: undefined,
  });

  const getRequirements = useCallback<GetRequirements>((requirements) => {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          accountWithEmailCreated: false,
          emailConfirmationRequired: true,
          ...(requirements ?? {}),
        });
      }, 1500)
    );
  }, []);

  const send = useCallback(
    async <S extends Step, E extends keyof Steps[S]>(
      currentStep: S,
      event: E
    ) => {
      getNextStep(currentStep, event, getRequirements, (partialState) =>
        setState((currentState) => ({ ...currentState, ...partialState }))
      ).then((nextStep) => {
        if (nextStep !== null) {
          setCurrentStep(nextStep);
          setState({ status: 'ok', error: undefined });
        }
      });
    },
    [getRequirements]
  );

  return {
    currentStep,
    state,
    send,
  };
}

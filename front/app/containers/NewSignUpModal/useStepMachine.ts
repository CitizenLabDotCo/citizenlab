import { useState, useCallback } from 'react';
import { getNextStep, Step, State } from './stepService';

export default function useStepMachine() {
  const [currentStep, setCurrentStep] = useState<Step>('inactive');
  const [state, setState] = useState<State>({
    status: 'pending',
    error: undefined,
  });

  const send = useCallback(async () => {
    setCurrentStep(getNextStep());
  }, []);

  return {
    currentStep,
    send,
  };
}

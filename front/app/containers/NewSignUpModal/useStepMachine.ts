import { useState, useEffect } from 'react';
import { stepService, send, Step } from './stepService';

export default function useStepMachine() {
  const [currentStep, setCurrentStep] = useState<Step>(
    stepService.initialState.value as Step
  );

  useEffect(() => {
    stepService.onTransition((nextStep) => {
      setCurrentStep(nextStep.value as Step);
    });
  }, []);

  return {
    currentStep,
    send,
  };
}

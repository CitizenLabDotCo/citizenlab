import { useState, useCallback, useMemo } from 'react';
import { Status, ErrorCode, Step } from '../typings';
import { getStepConfig } from './stepConfig';

export default function useSteps() {
  const [currentStep, setCurrentStep] = useState<Step>('closed');
  const [status, setStatus] = useState<Status>('ok');
  const [error, setError] = useState<ErrorCode | null>(null);

  const getRequirements = useCallback(async () => {
    return {
      authenticated: true,
      accountHasPassword: true,
      emailConfirmed: true,
      passwordAccepted: true,
    };
  }, []);

  const stepConfig = useMemo(
    () => getStepConfig(getRequirements, setCurrentStep, setStatus, setError),
    [getRequirements]
  );

  type StepConfig = typeof stepConfig;

  const transition = <S extends Step, T extends keyof StepConfig[S]>(
    currentStep: S,
    transition: T
  ) => {
    const action = stepConfig[currentStep][transition];

    const wrappedAction = ((...args) => {
      setError(null);
      // @ts-ignore
      action(...args);
    }) as StepConfig[S][T];

    return wrappedAction;
  };

  return {
    currentStep,
    status,
    error,
    transition,
  };
}

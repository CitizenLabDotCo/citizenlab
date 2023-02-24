import { useState, useCallback, useMemo } from 'react';
import { Status, ErrorCode, StepConfig, Step, Requirements } from '../typings';
import { getStepConfig } from './stepConfig';

let _mockRequirements = {
  authenticated: false,
  accountHasPassword: false,
  emailConfirmed: false,
  passwordAccepted: false,
};

export const _setMockRequirements = (
  newMockRequirements: Partial<Requirements>
) => {
  _mockRequirements = { ..._mockRequirements, ...newMockRequirements };
};

export default function useSteps() {
  const [currentStep, setCurrentStep] = useState<Step>('closed');
  const [status, setStatus] = useState<Status>('ok');
  const [error, setError] = useState<ErrorCode | null>(null);

  const getRequirements = useCallback(async () => {
    return _mockRequirements;
  }, []);

  const stepConfig = useMemo(
    () => getStepConfig(getRequirements, setCurrentStep, setStatus, setError),
    [getRequirements]
  );

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

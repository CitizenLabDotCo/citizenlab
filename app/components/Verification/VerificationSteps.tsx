import React, { memo, useCallback, useState, useEffect } from 'react';

// components
import VerificationMethods from './VerificationMethods';
import VerificationFormCOW from './VerificationFormCOW';
import VerificationFormBogus from './VerificationFormBogus';
import VerificationFormLookup from './VerificationFormLookup';

// style
import styled from 'styled-components';

// typings
import { IVerificationMethod, IDLookupMethod } from 'services/verificationMethods';
import { IParticipationContextType, ICitizenAction } from 'typings';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export type ProjectContext = { id: string, type: IParticipationContextType, action: ICitizenAction };

export type ErrorContext = { error: 'taken' | 'not_entitled' | null };

export type ContextShape = ProjectContext | ErrorContext | null;

export function isProjectContext(obj: ContextShape): obj is ProjectContext {
  return (obj as ProjectContext)?.id !== undefined;
}

export function isErrorContext(obj: ContextShape): obj is ErrorContext {
  return (obj as ErrorContext)?.error !== undefined;
}

export function isProjectOrErrorContext(obj: ContextShape) {
  if (obj === null) {
    return 'null';
  } else if ((obj as any).error !== undefined) {
    return 'ProjectContext';
  } else {
    return 'ErrorContext';
  }
}

export type TVerificationSteps = 'method-selection' | 'success' | 'error' | null | IVerificationMethod['attributes']['name'];

export interface Props {
  context: ContextShape; // TODO change to pass in additionnal rules info
  initialActiveStep: TVerificationSteps;
  onComplete?: () => void;
  onError?: () => void;
  className?: string;
}

const VerificationSteps = memo<Props>(({ className, context, initialActiveStep, onComplete, onError }) => {

  const [activeStep, setActiveStep] = useState<TVerificationSteps>(initialActiveStep);
  const [method, setMethod] = useState<IDLookupMethod | null>(null);

  useEffect(() => {
    if (activeStep === 'success' && onComplete) {
      onComplete();
    }

    if (activeStep === 'error' && (context === null || isErrorContext(context)) && onError) {
      onError();
    }
  }, [onComplete, onError, context, activeStep]);

  const onMethodSelected = useCallback((selectedMethod: IVerificationMethod) => {
    const { name } = selectedMethod.attributes;
    if (name === 'id_card_lookup') {
      // if the method name is id_card_lookup, then the method type is IDLookupMethod
      setMethod(selectedMethod as IDLookupMethod);
    }
    setActiveStep(name);
  }, []);

  const onCowCancel = useCallback(() => {
    setActiveStep('method-selection');
  }, []);

  const onCowVerified = useCallback(() => {
    setActiveStep('success');
  }, []);

  const onBogusCancel = useCallback(() => {
    setActiveStep('method-selection');
  }, []);

  const onBogusVerified = useCallback(() => {
    setActiveStep('success');
  }, []);

  const onLookupCancel = useCallback(() => {
    setActiveStep('method-selection');
    setMethod(null);
  }, []);

  const onLookupVerified = useCallback(() => {
    setActiveStep('success');
    setMethod(null);
  }, []);

  return (
    <Container className={`e2e-verification-modal ${className || ''}`}>
      {activeStep === 'method-selection' && (context === null || isProjectContext(context)) &&
        <VerificationMethods context={context} onMethodSelected={onMethodSelected} />
      }

      {activeStep === 'cow' &&
        <VerificationFormCOW onCancel={onCowCancel} onVerified={onCowVerified} />
      }

      {activeStep === 'bogus' &&
        <VerificationFormBogus onCancel={onBogusCancel} onVerified={onBogusVerified} />
      }

      {activeStep === 'id_card_lookup' && method &&
        <VerificationFormLookup onCancel={onLookupCancel} onVerified={onLookupVerified} method={method} />
      }
    </Container>
  );
});

export default VerificationSteps;

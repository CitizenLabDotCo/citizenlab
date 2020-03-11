import React, { memo, useCallback, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import VerificationMethods from './VerificationMethods';
import VerificationFormCOW from './VerificationFormCOW';
import VerificationFormBogus from './VerificationFormBogus';
import VerificationFormLookup from './VerificationFormLookup';
import Spinner from 'components/UI/Spinner';

// resource hooks
import useVerificationMethods from 'hooks/useVerificationMethods';

// style
import styled from 'styled-components';

// typings
import { IVerificationMethod, IDLookupMethod } from 'services/verificationMethods';
import { IParticipationContextType, ICitizenAction } from 'typings';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Loading = styled.div`
  width: 100%;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  showHeader?: boolean;
  inModal: boolean;
  onComplete?: () => void;
  onError?: () => void;
  className?: string;
}

const VerificationSteps = memo<Props>(({ className, context, initialActiveStep, showHeader, inModal, onComplete, onError }) => {

  const [activeStep, setActiveStep] = useState<TVerificationSteps>(initialActiveStep);
  const [method, setMethod] = useState<IDLookupMethod | null>(null);

  const verificationMethods = useVerificationMethods();

  useEffect(() => {
    if (!isNilOrError(verificationMethods) && verificationMethods.data.length === 1) {
      setMethod(verificationMethods.data[0] as IDLookupMethod);
      setActiveStep(verificationMethods.data[0].attributes.name);
    }
  }, [verificationMethods]);

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

  if (verificationMethods === undefined) {
    return (
      <Loading>
        <Spinner />
      </Loading>
    );
  }

  if (verificationMethods !== undefined) {
    return (
      <Container className={`e2e-verification-steps ${className || ''}`}>
        {activeStep === 'method-selection' && (context === null || isProjectContext(context)) &&
          <VerificationMethods
            context={context}
            showHeader={showHeader}
            inModal={inModal}
            onMethodSelected={onMethodSelected}
          />
        }

        {activeStep === 'cow' &&
          <VerificationFormCOW
            showHeader={showHeader}
            inModal={inModal}
            onCancel={onCowCancel}
            onVerified={onCowVerified}
          />
        }

        {activeStep === 'bogus' &&
          <VerificationFormBogus
            showHeader={showHeader}
            inModal={inModal}
            onCancel={onBogusCancel}
            onVerified={onBogusVerified}
          />
        }

        {activeStep === 'id_card_lookup' && method &&
          <VerificationFormLookup
            method={method}
            showHeader={showHeader}
            inModal={inModal}
            onCancel={onLookupCancel}
            onVerified={onLookupVerified}
          />
        }
      </Container>
    );
  }

  return null;
});

export default VerificationSteps;

import React, { memo, useCallback, useState, useEffect } from 'react';
import streams from 'utils/streams';

// components
import VerificationMethods from './VerificationMethods';
import VerificationFormCOW from './VerificationFormCOW';
import VerificationFormBogus from './VerificationFormBogus';
import VerificationFormLookup from './VerificationFormLookup';
import { Spinner } from 'cl2-component-library';

// resource hooks
import useAuthUser from 'hooks/useAuthUser';
import useVerificationMethods from 'hooks/useVerificationMethods';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import {
  IVerificationMethod,
  IDLookupMethod,
} from 'services/verificationMethods';
import { isNilOrError } from 'utils/helperUtils';
import {
  ContextShape,
  TVerificationSteps,
  IVerificationError,
} from './VerificationModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-bottom: 30px;

  ${media.smallerThanMinTablet`
    padding-bottom: 20px;
  `}
`;

const Loading = styled.div`
  width: 100%;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export interface Props {
  context: ContextShape; // TODO change to pass in additionnal rules info
  initialActiveStep: TVerificationSteps;
  showHeader?: boolean;
  inModal: boolean;
  skippable?: boolean;
  onComplete?: () => void;
  onSkipped?: () => void;
  onError?: () => void;
  className?: string;
  error?: IVerificationError | null | undefined;
}

const VerificationSteps = memo<Props>(
  ({
    className,
    context,
    initialActiveStep,
    showHeader,
    inModal,
    skippable,
    onComplete,
    onSkipped,
    onError,
    error,
  }) => {
    const [activeStep, setActiveStep] = useState<TVerificationSteps>(
      initialActiveStep || 'method-selection'
    );
    const [method, setMethod] = useState<IDLookupMethod | null>(null);

    const authUser = useAuthUser();
    const verificationMethods = useVerificationMethods();

    useEffect(() => {
      if (activeStep === 'success' && onComplete) {
        onComplete();
      }

      if (activeStep === 'error' && (context === null || error) && onError) {
        onError();
      }
    }, [onComplete, onError, context, activeStep]);

    const onMethodSelected = useCallback(
      (selectedMethod: IVerificationMethod) => {
        const { name } = selectedMethod.attributes;
        if (name === 'id_card_lookup') {
          // if the method name is id_card_lookup, then the method type is IDLookupMethod
          setMethod(selectedMethod as IDLookupMethod);
        }
        setActiveStep(name);
      },
      []
    );

    const goToSuccessStep = useCallback(() => {
      if (!isNilOrError(authUser)) {
        streams.reset({ data: authUser }).then(() => {
          setActiveStep('success');
          setMethod(null);
        });
      }
    }, [authUser]);

    const onCowCancel = useCallback(() => {
      setActiveStep('method-selection');
    }, []);

    const onCowVerified = useCallback(() => {
      goToSuccessStep();
    }, [goToSuccessStep]);

    const onBogusCancel = useCallback(() => {
      setActiveStep('method-selection');
    }, []);

    const onBogusVerified = useCallback(() => {
      goToSuccessStep();
    }, [goToSuccessStep]);

    const onLookupCancel = useCallback(() => {
      setActiveStep('method-selection');
      setMethod(null);
    }, []);

    const onLookupVerified = useCallback(() => {
      goToSuccessStep();
    }, [goToSuccessStep]);

    const onVerificationSkipped = useCallback(() => {
      onSkipped?.();
    }, [onSkipped]);

    if (verificationMethods === undefined) {
      return (
        <Loading>
          <Spinner />
        </Loading>
      );
    }

    if (verificationMethods !== undefined) {
      return (
        <Container
          id="e2e-verification-wizard-root"
          className={className || ''}
        >
          {activeStep === 'method-selection' && (
            <VerificationMethods
              context={context}
              showHeader={showHeader}
              inModal={inModal}
              skippable={skippable}
              onSkipped={onVerificationSkipped}
              onMethodSelected={onMethodSelected}
            />
          )}

          {activeStep === 'cow' && (
            <VerificationFormCOW
              showHeader={showHeader}
              inModal={inModal}
              onCancel={onCowCancel}
              onVerified={onCowVerified}
            />
          )}

          {activeStep === 'bogus' && (
            <VerificationFormBogus
              showHeader={showHeader}
              inModal={inModal}
              onCancel={onBogusCancel}
              onVerified={onBogusVerified}
            />
          )}

          {activeStep === 'id_card_lookup' && method && (
            <VerificationFormLookup
              method={method}
              showHeader={showHeader}
              inModal={inModal}
              onCancel={onLookupCancel}
              onVerified={onLookupVerified}
            />
          )}
        </Container>
      );
    }

    return null;
  }
);

export default VerificationSteps;

import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// resource hooks
import useTenant from 'hooks/useTenant';

// component
import SignUp, { InputProps as SignUpProps } from 'components/SignUp';
import SignIn from 'components/SignIn';

// styling
import styled from 'styled-components';

const Container = styled.div``;

interface Props extends SignUpProps {
  initialSelectedMethod: 'signup' | 'signin';
}

const SignUpIn = memo<Props>(({ initialSelectedMethod, initialActiveStep, isInvitation, token, accountCreationTitle, action, error, className }) => {
  const tenant = useTenant();

  const [selectedMethod, setSelectedMethod] = useState<'signup' | 'signin'>(initialSelectedMethod);

  const onSignUpCompleted = useCallback(() => {
    // empty
  }, []);

  const onSignInCompleted = useCallback(() => {
    // empty
  }, []);

  const onToggleSelectedMethod = useCallback(() => {
    setSelectedMethod(selectedMethod => selectedMethod === 'signup' ? 'signin' : 'signup');
  }, []);

  if (!isNilOrError(tenant)) {
    return (
      <Container className={className}>
        {selectedMethod === 'signup' ? (
          <SignUp
            initialActiveStep={initialActiveStep}
            inModal={false}
            accountCreationTitle={accountCreationTitle}
            isInvitation={isInvitation}
            token={token}
            action={action}
            error={error}
            onSignUpCompleted={onSignUpCompleted}
            onGoToSignIn={onToggleSelectedMethod}
          />
        ) : (
          <SignIn onSignedIn={onSignInCompleted} />
        )}
      </Container>
    );
  }

  return null;
});

export default SignUpIn;

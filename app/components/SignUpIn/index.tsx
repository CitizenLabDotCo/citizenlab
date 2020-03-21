import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isString, isBoolean, isEmpty, isObject } from 'lodash-es';
import { stringify, parse } from 'qs';
import clHistory from 'utils/cl-router/history';

// resource hooks
import useTenant from 'hooks/useTenant';

// component
import SignUp, { InputProps as SignUpProps, TSignUpSteps } from 'components/SignUp';
import SignIn, { InputProps as SignInProps } from 'components/SignIn';

// styling
import styled from 'styled-components';

const Container = styled.div``;

export type ISignUpInActionType = 'upvote' | 'downvote' | 'comment' | 'post';

export type ISignUpInActionContextType = 'idea' | 'initiative' | 'project' | 'phase';

export interface ISignUpInAction {
  action_type: ISignUpInActionType;
  action_context_type: ISignUpInActionContextType;
  action_context_id: string;
  action_context_pathname: string;
  action_requires_verification: boolean;
}

export const redirectActionToSignUpInPage = (action: ISignUpInAction) => {
  clHistory.push({
    pathname: '/sign-up',
    search: convertActionToUrlSearchParams(action)
  });
};

export function convertUrlSearchParamsToAction(input: string) {
  const action = parse(input, { ignoreQueryPrefix: true, decoder: (str, defaultEncoder, charset, type) => {
    if (type === 'value' && str === 'true') { return true; }
    if (type === 'value' && str === 'false') { return false; }
    return defaultEncoder(str, defaultEncoder, charset);
  }}) as ISignUpInAction;

  if (isObject(action) && !isEmpty(action)) {
    const { action_type, action_context_id, action_context_type, action_context_pathname, action_requires_verification } = action;

    if (
      action_type === ('upvote' || 'downvote' || 'comment' || 'post') &&
      action_context_type === ('idea' || 'initiative' || 'project' || 'phase') &&
      isString(action_context_id) &&
      isString(action_context_pathname) &&
      isBoolean(action_requires_verification)
    ) {
      return action;
    }
  }

  return;
}

export function convertActionToUrlSearchParams(action: ISignUpInAction) {
  return stringify(action, { addQueryPrefix: true });
}

export type TSignUpInMethods = 'signup' | 'signin';

interface Props extends Omit<SignUpProps, 'onGoToSignIn' | 'onSignUpCompleted' | 'initialActiveStep'>,  Omit<SignInProps, 'onGoToSignUp' | 'onSignInCompleted'> {
  initialActiveSignUpStep?: TSignUpSteps;
  initialActiveSignUpInMethod: TSignUpInMethods;
  onSignUpInCompleted: (method: TSignUpInMethods) => void;
}

const SignUpIn = memo<Props>(({
  initialActiveSignUpInMethod,
  initialActiveSignUpStep,
  isInvitation,
  token,
  action,
  error,
  onSignUpInCompleted,
  className
}) => {
  const tenant = useTenant();

  const [activeMethod, setActiveMethod] = useState(initialActiveSignUpInMethod);

  const onSignUpCompleted = useCallback(() => {
    onSignUpInCompleted('signup');
  }, [onSignUpInCompleted]);

  const onSignInCompleted = useCallback(() => {
    onSignUpInCompleted('signin');
  }, [onSignUpInCompleted]);

  const onToggleSelectedMethod = useCallback(() => {
    setActiveMethod(activeMethod => activeMethod === 'signup' ? 'signin' : 'signup');
  }, []);

  if (!isNilOrError(tenant)) {
    return (
      <Container className={className}>
        {activeMethod === 'signup' ? (
          <SignUp
            initialActiveStep={initialActiveSignUpStep}
            inModal={false}
            isInvitation={isInvitation}
            token={token}
            action={action}
            error={error}
            onSignUpCompleted={onSignUpCompleted}
            onGoToSignIn={onToggleSelectedMethod}
          />
        ) : (
          <SignIn
            onSignInCompleted={onSignInCompleted}
            onGoToSignUp={onToggleSelectedMethod}
          />
        )}
      </Container>
    );
  }

  return null;
});

export default SignUpIn;

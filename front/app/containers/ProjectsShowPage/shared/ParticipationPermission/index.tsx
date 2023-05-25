import React, { ReactNode } from 'react';

// components
import Warning from 'components/UI/Warning';

// i18n
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from './messages';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// styling
import styled from 'styled-components';

// utils
import { IPCPermissionAction } from 'services/actionPermissions';

const Container = styled.div`
  position: relative;

  &.enabled {
    min-height: 500px;
  }
`;

interface Props {
  projectId: string;
  phaseId: string | null;
  children: ReactNode;
  action: IPCPermissionAction;
  disabledMessage: MessageDescriptor | null;
  enabled: boolean;
  className?: string;
}

const ParticipationPermission = ({
  projectId,
  phaseId,
  className,
  children,
  action,
  disabledMessage,
  enabled,
}: Props) => {
  const signUpIn = (flow: 'signin' | 'signup') => {
    const pcType = phaseId ? 'phase' : 'project';
    const pcId = phaseId ?? projectId;

    if (!pcId || !pcType) return;

    triggerAuthenticationFlow({
      flow,
      context: {
        action,
        id: pcId,
        type: pcType,
      },
    });
  };

  const signIn = () => {
    signUpIn('signin');
  };

  const signUp = () => {
    signUpIn('signup');
  };

  return (
    <>
      {/*
        disabledMessage check is needed,
        FormattedMessage currently doesn't require it
        but crashes if disabledMessage is null
      */}
      {disabledMessage && (
        <Container className={`warning ${className || ''}`}>
          <Warning icon="lock">
            <FormattedMessage
              {...disabledMessage}
              values={{
                verificationLink: (
                  <button onClick={signUp}>
                    <FormattedMessage {...messages.verificationLinkText} />
                  </button>
                ),
                signUpLink: (
                  <button onClick={signUp}>
                    <FormattedMessage {...messages.signUpLinkText} />
                  </button>
                ),
                completeRegistrationLink: (
                  <button onClick={signUp}>
                    <FormattedMessage
                      {...messages.completeRegistrationLinkText}
                    />
                  </button>
                ),
                logInLink: (
                  <button onClick={signIn}>
                    <FormattedMessage {...messages.logInLinkText} />
                  </button>
                ),
              }}
            />
          </Warning>
        </Container>
      )}
      {enabled && <>{children}</>}
    </>
  );
};

export default ParticipationPermission;

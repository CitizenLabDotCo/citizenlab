import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Warning from 'components/UI/Warning';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// events
import { openVerificationModal } from 'components/Verification/verificationModalEvents';
import { openSignUpInModal } from 'components/SignUpIn/events';

// styling
import styled from 'styled-components';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';

const Container = styled.div`
  margin-bottom: 30px;
`;

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  commetingPermissions: GetInitiativesPermissionsChildProps;
}

interface Props extends InputProps, DataProps {}

class CommentingInitiativesDisabled extends PureComponent<Props> {
  calculateMessageDescriptor = () => {
    const { authUser, commetingPermissions } = this.props;
    const isLoggedIn = !isNilOrError(authUser);
    if (commetingPermissions?.enabled === true) {
      return null;
    } else if (
      commetingPermissions?.disabledReason === 'notPermitted' &&
      !isLoggedIn
    ) {
      return messages.commentingInitiativeMaybeNotPermitted;
    } else if (
      commetingPermissions?.disabledReason === 'notPermitted' &&
      isLoggedIn
    ) {
      return messages.commentingInitiativeNotPermitted;
    } else if (commetingPermissions?.action === 'verify') {
      return messages.commentingDisabledUnverified;
    } else if (commetingPermissions?.action === 'sign_in_up') {
      return messages.signInToCommentInitiative;
    } else if (commetingPermissions?.action === 'sign_in_up_and_verify') {
      return messages.signInAndVerifyToCommentInitiative;
    }
    return;
  };

  onVerify = () => {
    const { commetingPermissions } = this.props;
    if (commetingPermissions?.action === 'verify') {
      openVerificationModal({
        context: {
          action: 'commenting_initiative',
          type: 'initiative',
        },
      });
    }
  };

  signUpIn = (flow: 'signin' | 'signup') => {
    const { authUser, commetingPermissions } = this.props;

    if (isNilOrError(authUser)) {
      openSignUpInModal({
        flow,
        verification: commetingPermissions?.action === 'sign_in_up_and_verify',
        verificationContext:
          commetingPermissions?.action === 'sign_in_up_and_verify'
            ? {
                action: 'commenting_initiative',
                type: 'initiative',
              }
            : undefined,
      });
    }
  };

  signIn = () => {
    this.signUpIn('signin');
  };

  signUp = () => {
    this.signUpIn('signup');
  };

  render() {
    const messageDescriptor = this.calculateMessageDescriptor();

    if (messageDescriptor) {
      return (
        <Container className="e2e-commenting-disabled">
          <Warning>
            <FormattedMessage
              {...messageDescriptor}
              values={{
                signUpLink: (
                  <button onClick={this.signUp}>
                    <FormattedMessage {...messages.signUpLinkText} />
                  </button>
                ),
                signInLink: (
                  <button onClick={this.signIn}>
                    <FormattedMessage {...messages.signInLinkText} />
                  </button>
                ),
                verificationLink: (
                  <button onClick={this.onVerify}>
                    <FormattedMessage {...messages.verifyIdentityLinkText} />
                  </button>
                ),
              }}
            />
          </Warning>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  commetingPermissions: (
    <GetInitiativesPermissions action="commenting_initiative" />
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <CommentingInitiativesDisabled {...inputProps} {...dataProps} />
    )}
  </Data>
);

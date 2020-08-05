import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Warning from 'components/UI/Warning';
import T from 'components/T';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// services
import { IdeaCommentingDisabledReason } from 'services/ideas';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// events
import { openVerificationModal } from 'components/Verification/verificationModalEvents';
import { openSignUpInModal } from 'components/SignUpIn/events';

// styling
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: 30px;
`;

interface InputProps {
  projectId: string | null;
  phaseId: string | undefined;
  postId: string;
  postType: 'idea' | 'initiative';
  commentingEnabled: boolean | null;
  commentingDisabledReason: IdeaCommentingDisabledReason | null;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

class CommentingDisabled extends PureComponent<Props> {
  calculateMessageDescriptor = () => {
    const {
      authUser,
      commentingEnabled,
      commentingDisabledReason,
    } = this.props;
    const isLoggedIn = !isNilOrError(authUser);

    if (commentingEnabled && isLoggedIn) {
      return null;
    } else if (commentingDisabledReason === 'project_inactive') {
      return messages.commentingDisabledProjectInactive;
    } else if (commentingDisabledReason === 'commenting_disabled') {
      return messages.commentingDisabledInContext;
    } else if (commentingDisabledReason === 'idea_not_in_current_phase') {
      return messages.commentingDisabledIdeaNotInCurrentPhase;
    } else if (isLoggedIn && commentingDisabledReason === 'not_verified') {
      return messages.commentingDisabledNotVerified;
    } else if (isLoggedIn && commentingDisabledReason === 'not_permitted') {
      return messages.commentingNotPermitted;
    } else if (!isLoggedIn && commentingDisabledReason === 'not_permitted') {
      return messages.commentingMaybeNotPermitted;
    }

    return messages.signInToComment;
  };

  onVerify = () => {
    const { projectId, phaseId, commentingDisabledReason } = this.props;
    const pcType = phaseId ? 'phase' : projectId ? 'project' : null;
    const pcId =
      pcType === 'phase' ? phaseId : pcType === 'project' ? projectId : null;

    if (pcId && pcType && commentingDisabledReason === 'not_verified') {
      openVerificationModal({
        context: {
          action: 'commenting',
          id: pcId,
          type: pcType,
        },
      });
    }
  };

  signUpIn = (flow: 'signin' | 'signup') => {
    const { projectId, phaseId, commentingDisabledReason } = this.props;
    const pcType = phaseId ? 'phase' : projectId ? 'project' : null;
    const pcId =
      pcType === 'phase' ? phaseId : pcType === 'project' ? projectId : null;

    openSignUpInModal({
      flow,
      verification: commentingDisabledReason === 'not_verified',
      verificationContext: !!(
        commentingDisabledReason === 'not_verified' &&
        pcId &&
        pcType
      )
        ? {
            action: 'commenting',
            id: pcId,
            type: pcType,
          }
        : undefined,
    });
  };

  signIn = () => {
    this.signUpIn('signin');
  };

  signUp = () => {
    this.signUpIn('signup');
  };

  render() {
    const { project } = this.props;
    const messageDescriptor = this.calculateMessageDescriptor();
    const projectTitle = !isNilOrError(project)
      ? project.attributes.title_multiloc
      : null;

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
                    <FormattedMessage {...messages.verificationLinkText} />
                  </button>
                ),
                projectName: projectTitle && <T value={projectTitle} />,
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
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <CommentingDisabled {...inputProps} {...dataProps} />}
  </Data>
);

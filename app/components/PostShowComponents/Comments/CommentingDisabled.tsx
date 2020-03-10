import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Warning from 'components/UI/Warning';
import Link from 'utils/cl-router/Link';
import T from 'components/T';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// services
import { IIdeaData } from 'services/ideas';

// utils
import { redirectActionToSignUpPage } from 'components/SignUp';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// events
import { openVerificationModalWithContext } from 'containers/App/verificationModalEvents';

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
  isLoggedIn: boolean | null;
  commentingEnabled: boolean | null;
  commentingDisabledReason: IIdeaData['attributes']['action_descriptor']['commenting']['disabled_reason'] | null;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

class CommentingDisabled extends PureComponent<Props> {
  calculateMessageDescriptor = () => {
    const { authUser, isLoggedIn, commentingEnabled, commentingDisabledReason } = this.props;

    if (commentingEnabled && isLoggedIn) {
      return null;
    } else if (commentingDisabledReason === 'project_inactive') {
      return messages.commentingDisabledProjectInactive;
    } else if (commentingDisabledReason === 'commenting_disabled') {
      return messages.commentingDisabledInContext;
    } else if (commentingDisabledReason === 'idea_not_in_current_phase') {
      return messages.commentingDisabledIdeaNotInCurrentPhase;
    } else if (authUser && commentingDisabledReason === 'not_verified') {
      return messages.commentingDisabledNotVerified;
    } else if (isLoggedIn && commentingDisabledReason === 'not_permitted') {
      return messages.commentingNotPermitted;
    } else if (!isLoggedIn && commentingDisabledReason === 'not_permitted') {
      return messages.commentingMaybeNotPermitted;
    }

    return messages.signInToComment;
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  onVerify = () => {
    const { projectId, phaseId, postId, postType, authUser } = this.props;

    if (!isNilOrError(authUser)) {
      const pcId = phaseId || projectId || null;
      const pcType = phaseId ? 'phase' : 'project';
      pcId && openVerificationModalWithContext('ActionComment', pcId, pcType, 'commenting');
    } else {
      redirectActionToSignUpPage({
        action_type: 'comment',
        action_context_type: postType,
        action_context_id: postId,
        action_context_pathname: window.location.pathname,
        action_requires_verification: true
      });
    }
  }

  render() {
    const { project } = this.props;
    const messageDescriptor = this.calculateMessageDescriptor();
    const projectTitle = (!isNilOrError(project) ? project.attributes.title_multiloc : null);

    if (messageDescriptor) {
      return (
        <Container className="e2e-commenting-disabled">
          <Warning>
            <FormattedMessage
              {...messageDescriptor}
              values={{
                signUpLink: <Link to="/sign-up"><FormattedMessage {...messages.signUpLinkText} /></Link>,
                signInLink: <Link to="/sign-in"><FormattedMessage {...messages.signInLinkText} /></Link>,
                verificationLink: <button onMouseDown={this.removeFocus} onClick={this.onVerify}><FormattedMessage {...messages.verificationLinkText} /></button>,
                projectName: projectTitle && <T value={projectTitle} />
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
  project: ({ projectId, render }) => <GetProject projectId={projectId}>{render}</GetProject>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentingDisabled {...inputProps} {...dataProps} />}
  </Data>
);

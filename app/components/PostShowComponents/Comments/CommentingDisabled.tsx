import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

// components
import Warning from 'components/UI/Warning';
import Link from 'utils/cl-router/Link';
import T from 'components/T';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// services
import { IIdeaData } from 'services/ideas';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// events
import { openVerificationModalWithContext } from 'containers/App/events';

const Container = styled.div`
  margin-bottom: 40px;
`;

interface InputProps {
  projectId: string | null;
  phaseId: string | undefined;
  isLoggedIn: boolean | null;
  commentingEnabled: boolean | null;
  commentingDisabledReason: IIdeaData['attributes']['action_descriptor']['commenting']['disabled_reason'] | null;
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

class CommentingDisabled extends PureComponent<Props> {
  calculateMessageDescriptor = () => {
    const { isLoggedIn, commentingEnabled, commentingDisabledReason } = this.props;

    if (commentingEnabled && isLoggedIn) {
      return null;
    } else if (commentingDisabledReason === 'project_inactive') {
      return messages.commentingDisabledProjectInactive;
    } else if (commentingDisabledReason === 'commenting_disabled') {
      return messages.commentingDisabledInContext;
    } else if (commentingDisabledReason === 'idea_not_in_current_phase') {
      return messages.commentingDisabledIdeaNotInCurrentPhase;
    } else if (commentingDisabledReason === 'not_verified') {
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
    const { projectId, phaseId } = this.props;
    if (phaseId) {
      openVerificationModalWithContext('ActionComment', phaseId, 'phase', 'commenting');
    } else if (projectId) {
      openVerificationModalWithContext('ActionComment', projectId, 'project', 'commenting');
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

export default (inputProps: InputProps) => (
  <GetProject projectId={inputProps.projectId}>
    {project => <CommentingDisabled {...inputProps} project={project} />}
  </GetProject>
);

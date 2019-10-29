import React, { MouseEvent, PureComponent } from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { darken } from 'polished';
import { FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import { IIdeaData } from 'services/ideas';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import messages from './messages';
import clHistory from 'utils/cl-router/history';
import { fontSizes, colors } from 'utils/styleUtils';
import { openVerificationModalWithContext } from 'containers/App/events';

const Container = styled.div`
  width: 100%;
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  line-height: 20px;

  > span {
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
  }
`;

const StyledButton = styled.button`
  color: ${colors.clBlueDark};
  text-decoration: underline;
  transition: all 100ms ease-out;
  display: inline-block;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

interface InputProps {
  projectId: string;
  votingDescriptor: IIdeaData['attributes']['action_descriptor']['voting'];
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps { }

interface State { }

class VotingDisabled extends PureComponent<Props, State> {
  onVerify = () => {
    openVerificationModalWithContext('ActionVote');
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  reasonToMessage = () => {
    const { disabled_reason, future_enabled } = this.props.votingDescriptor;

    if (disabled_reason === 'project_inactive') {
      return future_enabled ? messages.votingDisabledPossibleLater : messages.votingDisabledProjectInactive;
    } else if (disabled_reason === 'voting_disabled' && future_enabled) {
      return messages.votingDisabledPossibleLater;
    } else if (disabled_reason === 'voting_limited_max_reached') {
      return messages.votingDisabledMaxReached;
    } else if (disabled_reason === 'idea_not_in_current_phase') {
      return future_enabled ? messages.votingDisabledPhaseNotYetStarted : messages.votingDisabledPhaseCompleted;
    } else if (disabled_reason === 'not_permitted') {
      return messages.votingDisabledNotPermitted;
    } else if (disabled_reason === 'not_verified') {
      return messages.votingDisabledNotVerified;
    } else {
      return messages.votingDisabledForProject;
    }
  }

  handleProjectLinkClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isNilOrError(this.props.project)) {
      clHistory.push(`/projects/${this.props.project.attributes.slug}`);
    }
  }

  render() {
    const { votingDescriptor, project } = this.props;
    const projectTitle = (!isNilOrError(project) ? project.attributes.title_multiloc : {});
    const message = this.reasonToMessage();
    const enabledFromDate = (votingDescriptor.future_enabled ? (
      <FormattedDate
        value={votingDescriptor.future_enabled}
        year="numeric"
        month="long"
        day="numeric"
      />
    ) : null);
    const projectName = (
      <StyledButton onClick={this.handleProjectLinkClick} onMouseDown={this.removeFocus} role="navigation">
        <T value={projectTitle} />
      </StyledButton>
    );
    const verificationLink = (
      <StyledButton onClick={this.onVerify} onMouseDown={this.removeFocus}>
        <FormattedMessage {...messages.verificationLinkText} />
      </StyledButton>
    );

    return (
      <Container>
        <FormattedMessage
          {...message}
          values={{
            enabledFromDate,
            projectName,
            verificationLink
          }}
        />
      </Container>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetProject id={inputProps.projectId}>
    {project => <VotingDisabled {...inputProps} project={project} />}
  </GetProject>
);

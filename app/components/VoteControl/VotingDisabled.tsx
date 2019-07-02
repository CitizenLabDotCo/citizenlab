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
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  color: ${({ theme }) => theme.colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  line-height: 20px;
`;

const ProjectLink = styled.span`
  color: ${({ theme }) => theme.colors.clBlueDark};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => darken(0.15, theme.colors.clBlueDark)};
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

interface Props extends InputProps, DataProps {}

interface State {}

class VotingDisabled extends PureComponent<Props, State> {

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
      <ProjectLink onClick={this.handleProjectLinkClick} role="navigation">
        <T value={projectTitle} />
      </ProjectLink>
    );

    return (
      <Container>
        <FormattedMessage {...message} values={{ enabledFromDate, projectName }} />
      </Container>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetProject id={inputProps.projectId}>
    {project => <VotingDisabled {...inputProps} project={project} />}
  </GetProject>
);

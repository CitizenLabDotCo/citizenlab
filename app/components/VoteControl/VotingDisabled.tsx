import React from 'react';
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
  color: ${(props) => props.theme.colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  line-height: 20px;
`;

const ProjectLink = styled.span`
  color: ${(props) => props.theme.colors.clBlueDark};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colors.clBlueDark)};
    text-decoration: underline;
  }
`;

interface InputProps {
  projectId: string;
  votingDescriptor: IIdeaData['relationships']['action_descriptor']['data']['voting'];
}

interface DataProps {
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class VotingDisabled extends React.PureComponent<Props, State> {

  reasonToMessage = () => {
    const { disabled_reason, future_enabled } = this.props.votingDescriptor;

    if (disabled_reason === 'project_inactive') {
      return messages.votingDisabledProjectInactive;
    } else if (disabled_reason === 'voting_disabled' && future_enabled) {
      return messages.votingDisabledPossibleLater;
    } else if (disabled_reason === 'voting_limited_max_reached') {
      return messages.votingDisabledMaxReached;
    } else if (disabled_reason === 'not_in_active_context') {
      return messages.votingDisabledNotInActiveContext;
    } else {
      return messages.votingDisabledForProject;
    }
  }

  handleProjectLinkClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { project } = this.props;

    if (!isNilOrError(project)) {
      clHistory.push(`/projects/${project.attributes.slug}`);
    }
  }

  render() {
    const { votingDescriptor, project } = this.props;
    const projectTitle = (!isNilOrError(project) ? project.attributes.title_multiloc : {});
    const message = this.reasonToMessage();

    return (
      <Container>
        <FormattedMessage
          {...message}
          values={{
            enabledFromDate: votingDescriptor.future_enabled && <FormattedDate value={votingDescriptor.future_enabled} />,
            projectName:
              <ProjectLink onClick={this.handleProjectLinkClick} role="navigation">
                <T value={projectTitle} />
              </ProjectLink>
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

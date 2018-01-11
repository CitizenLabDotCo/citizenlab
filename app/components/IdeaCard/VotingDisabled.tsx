import * as React from 'react';
import styled from 'styled-components';

import { Link } from 'react-router';
import { FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import BottomBounceUp from './BottomBounceUp';
import T from 'components/T';

import { IIdeaData } from 'services/ideas';
import { projectByIdStream, IProjectData } from 'services/projects';
import { injectResource, InjectedResourceLoaderProps } from 'utils/resourceLoaders/resourceLoader';

import messages from './messages';

const ReasonContainer = styled.div`
  color: #84939d;
  font-size: 14px;
  font-weight: 300;
  line-height: 20px;
  padding: 22px;
`;

type Props = {
  votingDescriptor: IIdeaData['relationships']['action_descriptor']['data']['voting'];
};

class VotingDisabled extends React.PureComponent<Props & InjectedResourceLoaderProps<IProjectData>> {

  reasonToMessage = () => {
    const { disabled_reason, future_enabled } = this.props.votingDescriptor;
    if (disabled_reason === 'no_active_context') {
      return messages.votingDisabledNoActiveContext;
    } else if (disabled_reason === 'voting_disabled' && future_enabled) {
      return messages.votingDisabledPossibleLater;
    } else if (disabled_reason === 'voting_limited_max_reached') {
      return messages.votingDisabledMaxReached;
    } else {
      return messages.votingDisabledForProject;
    }
  }

  handleProjectLinkClick = (event) => {
    event.stopPropagation();
  }

  render() {
    const { votingDescriptor, project } = this.props;
    const projectTitle = project && project.attributes.title_multiloc || {};
    const projectSlug = project && project.attributes.slug;
    const message = this.reasonToMessage();
    return (
      <BottomBounceUp icon="lock-outlined">
        <ReasonContainer>
          <FormattedMessage
            {...message}
            values={{
              enabledFromDate: votingDescriptor.future_enabled && <FormattedDate value={votingDescriptor.future_enabled} />,
              projectName: <Link to={`/projects/${projectSlug}`} onClick={this.handleProjectLinkClick}><T value={projectTitle} /></Link>
            }}
          />
        </ReasonContainer>
      </BottomBounceUp>
    );
  }
}

export default injectResource('project', projectByIdStream, (props) => props.projectId)(VotingDisabled);

import * as React from 'react';
import { flow } from 'lodash';
import styled from 'styled-components';

import { IProjectData, projectByIdStream } from 'services/projects';
import { IPhaseData, phaseStream } from 'services/phases';
import { postingButtonState } from 'services/ideaPostingRules';

import { injectResource } from 'utils/resourceLoaders/resourceLoader';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const DisabledText = styled.div`
  color: rgba(121, 137, 147, 1);
  font-size: 14px;
  font-weight: 400;
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  height: 1rem;
  width: 1rem;
  margin-right: 0.5rem;
`;

type Props = {
  project?: IProjectData;
  phase?: IPhaseData;
  onClick?: () => void;
};

type State = {};

class IdeaButton extends React.Component<Props, State> {

  handleOnAddIdeaClick = () => {
    this.props.onClick && this.props.onClick();
  }

  render() {
    const { project, phase } = this.props;
    const { show, enabled } = postingButtonState({ project, phase });

    if (!show) {
      return (
        <DisabledText>
          <StyledIcon name="lock-outlined" />
          <FormattedMessage {...messages.postingHereImpossible} />
        </DisabledText>
      );
    }

    return (
      <Button
        onClick={this.props.onClick}
        icon="plus-circle"
        style="primary"
        size="2"
        text={<FormattedMessage {...messages.postIdeaHere} />}
        circularCorners={false}
        disabled={!enabled}
      />
    );
  }
}

export default flow(
  injectResource('project', projectByIdStream, props => props.projectId),
  injectResource('phase', phaseStream, props => props.phaseId)
)(IdeaButton);

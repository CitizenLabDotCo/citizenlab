import * as React from 'react';
import { flow } from 'lodash';
// import { browserHistory } from 'react-router';

import { IProjectData, projectByIdStream } from 'services/projects';
import { IPhaseData, phaseStream } from 'services/phases';
import { postingButtonState } from 'services/ideaPostingRules';

import { injectResource } from 'utils/resourceLoaders/resourceLoader';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

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

    if (!show) return null;

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

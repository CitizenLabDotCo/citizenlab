import React from 'react';
import { adopt } from 'react-adopt';

// components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

// services
import { postingButtonState } from 'services/ideaPostingRules';

// resources
import GetProject, { GetProjectChildProps } from 'utils/resourceLoaders/components/GetProject';
import GetPhase, { GetPhaseChildProps } from 'utils/resourceLoaders/components/GetPhase';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

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

interface InputProps {
  projectId?: string;
  phaseId?: string;
  onClick?: () => void;
}

interface DataProps {
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeaButton extends React.PureComponent<Props, State> {

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

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => <GetProject id={projectId}>{render}</GetProject>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => {
  return (
    <Data {...inputProps}>
      {dataProps => <IdeaButton {...inputProps} {...dataProps} />}
    </Data>
  );
};

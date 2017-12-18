// Libraries
import * as React from 'react';

// Components
import Tooltip from '../Tooltip';
import Button from '../Button';
import { IconNames } from '../Icon';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';

const Wrapper = styled.div`
  margin-top: 50px;
  position: relative;
`;

const Toggle = styled(Button)`
  .Button {
    font-weight: 300;
    padding-left: 0;
    padding-right: 0;
  }
`;

const Action = styled(Button)`

`;

// Typing
export interface Action {
  label: string;
  handler: {(): void};
  icon?: IconNames;
}
interface Props {
  actions: Action[];
  hideLabel?: boolean;
  className?: string;
}
interface State {
  visible: boolean;
}

export default class MoreActions extends React.Component<Props, State> {
  constructor (props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  hideTooltip = (event) => {
    event.stopPropagation();
    this.setState({ visible: false });
  }

  toggleTooltip = (event) => {
    this.setState({ visible: !this.state.visible });
  }

  render () {
    if (this.props.actions.length === 0) {
      return null;
    }
    return (
      <Wrapper className={this.props.className} >
        <Toggle style="text" icon="more_actions_horizontal" onClick={this.toggleTooltip}>
          {!this.props.hideLabel && <FormattedMessage {...messages.buttonLabel} />}
        </Toggle>
        <Tooltip visible={this.state.visible} hideTooltip={this.hideTooltip} theme="dark" position="right">
          {this.props.actions.map((action) => (
            <Action
              style="text"
              key={action.label}
              onClick={action.handler}
              icon={action.icon}
              text={action.label}
              circularCorners={false}
            />
          ))}
        </Tooltip>
      </Wrapper>
    );
  }

}

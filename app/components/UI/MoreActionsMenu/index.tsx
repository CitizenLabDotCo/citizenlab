// Libraries
import * as React from 'react';

// Components
import Tooltip from '../Tooltip';
import Button from '../Button';

// Typing
interface Props {
  actions: {
    label: string;
    handler: {(): void};
    icon?: string;
  }[];
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
    return (
      <div>
        <Button style="text" onClick={this.toggleTooltip}>More actions</Button>
        <Tooltip visible={this.state.visible} hideTooltip={this.hideTooltip}>
          {this.props.actions.map((action) => (
            <Button
              style="text"
              key={action.label}
              onClick={action.handler}
              icon={action.icon}
              text={action.label}
            />
          ))}
        </Tooltip>
      </div>
    );
  }

}

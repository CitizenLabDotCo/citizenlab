// Libraries
import * as React from 'react';

// Components
import clickOutside from 'utils/containers/clickOutside';
import Transition from 'react-transition-group/Transition';

// Styling
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

const Container = styled(clickOutside)`
  background: white;
  border-radius: 5px;
  border: 1px solid ${color('separation')};
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  position: absolute;
  transform: scale(1);
  opacity: 1;
  transition: all .2s;

  &.exited {
    transform: scale(.1);
    opacity: 0;
  }
`;

// Typing
interface Props {
  visible: boolean;
  hideTooltip: {(): void};
}

interface State {}

export default class Tooltip extends React.Component<Props, State> {

  constructor (props) {
    super(props);

    this.state = {};
  }

  handleClickOutside = () => {
    if (this.props.visible) {
      this.props.hideTooltip();
    }
  }

  render () {
    return (
      <Transition in={this.props.visible} timeout={300}>
        {(status) => (
          <Container onClickOutside={this.handleClickOutside} className={`e2e-tooltip ${status}`}>
            {this.props.children}
          </Container>
        )}
      </Transition>
    );
  }
}

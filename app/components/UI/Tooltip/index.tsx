// Libraries
import * as React from 'react';

// Components
import clickOutside from 'utils/containers/clickOutside';
import Transition from 'react-transition-group/Transition';

// Styling
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

const Container = styled(clickOutside)`
  align-items: stretch;
  background: white;
  border-radius: 5px;
  border-color: white;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  font-size: ${fontSize('base')};
  opacity: 1;
  padding: 10px;
  position: absolute;
  transform: scale(1);
  transition: all .1s ease-in-out;
  z-index: 1000;

  ::after {
    content: "";
    display: block;
    position: absolute;
    border: 1rem solid;
    border-color: transparent;
  }

  &.exited {
    transform: scale(.1);
    opacity: 0;
  }

  /* Positions */
  &.position-bottom {
    right: 0;
    top: 100%;

    ::after {
      bottom: 100%;
      right: 1rem;
      border-bottom-color: inherit;
    }
  }

  &.position-right {
    bottom: 0;
    left: 100%;

    ::after {
      right: 100%;
      bottom: 1rem;
      border-right-color: inherit;
    }
  }

  &.position-top {
    bottom: 100%;
    right: 0;

    ::after {
      right: 1rem;
      top: 100%;
      border-top-color: inherit;
    }
  }

  /* Themes */
  &.dark {
    background: ${color('clBlueDarkest')};
    border-color: ${color('clBlueDarkest')};
    color: rgba(255, 255, 255, .65);
    fill: rgba(255, 255, 255, .65);

    .Button {
      color: inherit;
      fill: inherit;

      &.text:hover {
        background: rgba(255, 255, 255, .1);
        color: white;
        fill: white;
      }
    }
  }
`;

// Typing
interface Props {
  visible: boolean;
  hideTooltip: {(event): void};
  theme?: 'dark';
  position?: 'bottom' | 'top' | 'right' | null;
}

interface State {}

export default class Tooltip extends React.Component<Props, State> {

  constructor (props) {
    super(props);

    this.state = {};
  }

  handleClickOutside = (event) => {
    if (this.props.visible) {
      this.props.hideTooltip(event);
    }
  }

  render () {
    const { visible, theme, children } = this.props;
    const position = this.props.position || 'bottom';

    return (
      <Transition in={visible} timeout={300}>
        {(status) => (
          <Container onClickOutside={this.handleClickOutside} className={`e2e-tooltip ${status} ${theme} position-${position}`}>
            {children}
          </Container>
        )}
      </Transition>
    );
  }
}

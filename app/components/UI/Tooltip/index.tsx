// Libraries
import * as React from 'react';

// Components
import clickOutside from 'utils/containers/clickOutside';

// Animation
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// Styling
import styled from 'styled-components';
import { color } from 'utils/styleUtils';

const enterTimeout = 200;
const exitTimeout = 200;

const Container = styled(clickOutside)`
  /* display: flex;
  align-items: stretch;
  flex-direction: column; */
  background: white;
  border-radius: 5px;
  border-color: white;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 300;
  line-height: 18px;
  opacity: 1;
  padding: 6px;
  position: relative;
  z-index: 2;
  transform-origin: left top;

  ::after {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    top: -20px;
    left: 15px;
    border-color: transparent transparent ${color('clBlueDarkest')} transparent;
    border-width: 10px;
  }

  &.tooltip-enter {
    transform: scale(0.8);
    opacity: 0;
    transition: all ${enterTimeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

    &.tooltip-enter-active {
      transform: scale(1);
      opacity: 1;
    }
  }

  &.tooltip-exit {
    opacity: 1;
    transition: all ${exitTimeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

    &.tooltip-exit-active {
      opacity: 0;
    }
  }

  /*
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
  */

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

interface Props {
  visible: boolean;
  hideTooltip: {(event): void};
  theme?: 'dark';
  position?: 'bottom' | 'top' | 'right' | null;
}

interface State {}

export default class Tooltip extends React.PureComponent<Props, State> {
  handleClickOutside = (event) => {
    if (this.props.visible) {
      this.props.hideTooltip(event);
    }
  }

  render () {
    const { visible, theme, children } = this.props;
    const position = this.props.position || 'bottom';
    const className = this.props['className'];
    const timeout = {
      enter: enterTimeout,
      exit: exitTimeout
    };

    return (
      <TransitionGroup>
        {visible &&
          <CSSTransition
            classNames="tooltip"
            timeout={timeout}
            exit={true}
          >
            <Container
              onClickOutside={this.handleClickOutside}
              className={`e2e-tooltip tooltip ${className} ${status} ${theme} position-${position}`}
            >
              {children}
            </Container>
          </CSSTransition>
        }
      </TransitionGroup>
    );
  }
}

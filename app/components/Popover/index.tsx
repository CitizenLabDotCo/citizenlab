import * as React from 'react';
import styled from 'styled-components';

// components
import ClickOutside from 'utils/containers/clickOutside';

// animation
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

const timeout = 200;
const easing = `cubic-bezier(0.19, 1, 0.22, 1)`;

const Container = styled(ClickOutside)`
  min-width: 200px;
  position: absolute;
  top: 42px;
  right: -10px;
  z-index: 1;
  background: #fff;
  padding: 6px;
  border-radius: 5px;
  box-sizing: border-box;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.12);
  border: solid 1px #e0e0e0;
  transform-origin: right top;

  ::before,
  ::after {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  ::after {
    top: -20px;
    right: 11px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    right: 10px;
    border-color: transparent transparent #e0e0e0 transparent;
    border-width: 11px;
  }

  &.dropdown-enter {
    opacity: 0;
    transform: scale(0.9);

    &.dropdown-enter-active {
      opacity: 1;
      transform: scale(1);
      transition: all ${timeout}ms ${easing};
    }
  }
`;

type Props = {
  children: any,
  className?: string,
  open: boolean,
  onCloseRequest?: () => void,
  id?: string,
  setRef?: (arg: HTMLElement) => void;
};

export default class Popover extends React.PureComponent<Props> {

  clickOutside = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (this.props.onCloseRequest) {
      this.props.onCloseRequest();
    }
  }

  handleSetRef = (element: HTMLElement) => {
    if (this.props.setRef) {
      this.props.setRef(element);
    }
  }

  render() {
    return (
      <TransitionGroup>
        {this.props.open &&
          <CSSTransition
            classNames="dropdown"
            timeout={timeout}
            exit={false}
          >
            <Container
              onClickOutside={this.clickOutside}
              className={this.props.className}
              id={this.props.id}
              setRef={this.handleSetRef}
            >
              {this.props.children}
            </Container>
          </CSSTransition>
        }
      </TransitionGroup>
    );
  }
}

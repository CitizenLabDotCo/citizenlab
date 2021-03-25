import React from 'react';

// style
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';

const transitionDuration = 600;

const ButtonBarContainer = styled.div`
  width: 100%;
  height: 68px;
  position: fixed;
  z-index: 2;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: solid 1px #ddd;

  &.buttonbar-enter {
    transform: translateY(64px);

    &.buttonbar-enter-active {
      transform: translateY(0);
      transition: transform ${transitionDuration}ms
        cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.buttonbar-exit {
    transform: translateY(0);

    &.buttonbar-exit-active {
      transform: translateY(64px);
      transition: transform ${transitionDuration}ms
        cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

interface Props {
  children: JSX.Element;
}

interface GlobalState {
  submitError: boolean;
  processing: boolean;
}

interface State extends GlobalState {}

export default class ButtonBar extends React.PureComponent<Props, State> {
  render() {
    return (
      <CSSTransition classNames="buttonbar" timeout={transitionDuration}>
        <ButtonBarContainer>
          <Container>{this.props.children}</Container>
        </ButtonBarContainer>
      </CSSTransition>
    );
  }
}

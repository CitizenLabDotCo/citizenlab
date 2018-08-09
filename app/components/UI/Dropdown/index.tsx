import React, { PureComponent, FormEvent } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';
import styled from 'styled-components';

const timeout = 200;

const Container: any = styled(clickOutside)`
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
  border: solid 1px #e0e0e0;
  position: absolute;
  top: 35px;
  left: -10px;
  transform-origin: ${(props: any) => props.transformOriginXOffset} top;
  z-index: 5;

  * {
    user-select: none;
  }

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
    left: 20px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: 19px;
    border-color: transparent transparent #e0e0e0 transparent;
    border-width: 11px;
  }

  &.dropdown-enter {
    opacity: 0;
    transform: scale(0.9);

    &.dropdown-enter-active {
      opacity: 1;
      transform: scale(1);
      transition: all ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

const ContainerInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
`;

const Content: any = styled.div`
  max-height: ${(props: any) => props.maxHeight};
  width: 280px;
  display: flex;
  flex-direction: column;
  margin: 10px;
  margin-right: 5px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const Footer = styled.div`
  flex: 1 0 auto;
  width: 100%;
  display: flex;
`;

interface Props {
  opened: boolean;
  transformOriginXOffset?: string;
  content: JSX.Element;
  footer?: JSX.Element;
  maxHeight?: string;
  toggleOpened: (event: FormEvent) => void;
}

interface State {}

export default class Dropdown extends PureComponent<Props, State> {
  close = (event: FormEvent) => {
    this.props.toggleOpened(event);
  }

  render() {
    const { opened, maxHeight, transformOriginXOffset, content, footer } = this.props;

    return (
      <CSSTransition
        in={opened}
        timeout={timeout}
        mountOnEnter={true}
        unmountOnExit={true}
        classNames={`${this.props['className']} dropdown`}
        exit={false}
      >
        <Container
          onClickOutside={this.close}
          transformOriginXOffset={transformOriginXOffset || 'left'}
        >
          <ContainerInner>
            <Content maxHeight={maxHeight || '410px'}>
              {content}
            </Content>

            {footer &&
              <Footer>
                {footer}
              </Footer>
            }
          </ContainerInner>
        </Container>
      </CSSTransition>
    );
  }
}

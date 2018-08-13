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
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.2);
  z-index: 5;
  position: absolute;
  top: ${(props: Props) => props.top};
  left: ${(props: Props) => props.left};
  right: ${(props: Props) => props.right};
  outline: none;

  * {
    user-select: none;
  }

  &.dropdown-enter {
    opacity: 0;
    transform: translateY(-10px);

    &.dropdown-enter-active {
      opacity: 1;
      transform: translateY(0px);
      transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
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
  width: ${(props: Props) => props.width};
  max-height: ${(props: any) => props.maxHeight};
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 5px;
  margin-right: 5px;
  padding-left: 5px;
  padding-right: 5px;
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
  width?: string;
  top?: string;
  left? : string;
  right?: string;
  content: JSX.Element;
  footer?: JSX.Element;
  maxHeight?: string;
  toggleOpened: (event: FormEvent) => void;
}

interface State {}

export default class Dropdown extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    width: '280px',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    maxHeight: '410px'
  };

  close = (event: FormEvent) => {
    this.props.toggleOpened(event);
  }

  render() {
    const { opened, width, top, left, right, maxHeight, content, footer } = this.props;

    return (
      <CSSTransition
        in={opened}
        timeout={timeout}
        mountOnEnter={true}
        unmountOnExit={true}
        exit={false}
        classNames={`${this.props['className']} dropdown`}
      >
        <Container
          top={top}
          left={left}
          right={right}
          onClickOutside={this.close}
        >
          <ContainerInner>
            <Content
              width={width}
              maxHeight={maxHeight}
            >
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

import React, { PureComponent, FormEvent } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

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
  transition: none;

  * {
    user-select: none;
  }

  ${media.smallerThanMaxTablet`
    left: ${(props: Props) => props.mobileLeft};
    right: ${(props: Props) => props.mobileRight};
  `}

  &.dropdown-enter {
    opacity: 0;
    transform: translateY(-8px);

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

  ${media.smallerThanMaxTablet`
    width: ${(props: Props) => props.mobileWidth};
    max-height: ${(props: any) => props.mobileMaxHeight};
  `}
`;

const Footer = styled.div`
  flex: 1 0 auto;
  width: 100%;
  display: flex;
`;

interface Props {
  opened: boolean;
  width?: string;
  mobileWidth?: string;
  maxHeight?: string;
  mobileMaxHeight?: string;
  top?: string;
  left? : string;
  mobileLeft?: string;
  right?: string;
  mobileRight?: string;
  content: JSX.Element;
  footer?: JSX.Element;
  onClickOutside?: (event: FormEvent) => void;
  id?: string;
}

interface State {}

export default class Dropdown extends PureComponent<Props, State> {
  dropdownElement: HTMLElement | null = null;

  static defaultProps: Partial<Props> = {
    width: '260px',
    mobileWidth: '190px',
    maxHeight: '300px',
    mobileMaxHeight: '300px',
    top: 'auto',
    left: 'auto',
    mobileLeft: 'auto',
    right: 'auto',
    mobileRight: 'auto'
  };

  componentWillUnmount() {
    if (this.dropdownElement) {
      this.dropdownElement.removeEventListener('wheel', this.scrolling, false);
    }
  }

  scrolling = (event: WheelEvent) => {
    // prevent body from scrolling
    if (this.dropdownElement) {
      const deltaY = (event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY);
      this.dropdownElement.scrollTop += deltaY;
      event.preventDefault();
    }
  }

  setRef = (element: HTMLElement) => {
    if (element) {
      this.dropdownElement = element;

      if (this.dropdownElement) {
        this.dropdownElement.addEventListener('wheel', this.scrolling, false);
      }
    }
  }

  close = (event: FormEvent) => {
    event.preventDefault();

    if (this.props.opened && this.props.onClickOutside) {
      this.props.onClickOutside(event);
    }
  }

  render() {
    const {
      opened,
      width,
      mobileWidth,
      maxHeight,
      mobileMaxHeight,
      top,
      left,
      mobileLeft,
      right,
      mobileRight,
      content,
      footer,
      id
    } = this.props;

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
          id={id}
          width={width}
          mobileWidth={mobileWidth}
          top={top}
          left={left}
          mobileLeft={mobileLeft}
          right={right}
          mobileRight={mobileRight}
          onClickOutside={this.close}
        >
          <ContainerInner>
            <Content
              width={width}
              mobileWidth={mobileWidth}
              maxHeight={maxHeight}
              mobileMaxHeight={mobileMaxHeight}
              innerRef={this.setRef}
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

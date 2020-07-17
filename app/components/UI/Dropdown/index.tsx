import React, { PureComponent, FormEvent } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

const timeout = 200;

const Container = styled(clickOutside)<{
  top: string;
  left: string;
  right: string;
  mobileLeft: string;
  mobileRight: string;
}>`
  border-radius: ${(props: any) => props.theme.borderRadius};
  background-color: #fff;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.18);
  z-index: 5;
  position: absolute;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  right: ${(props) => props.right};
  transition: none;

  * {
    user-select: none;
  }

  ${media.smallerThanMaxTablet`
    left: ${(props) => props.mobileLeft};
    right: ${(props) => props.mobileRight};
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

const ContainerInner = styled.div<{ width: string; mobileWidth: string }>`
  width: ${(props) => props.width};

  ${media.smallerThanMaxTablet`
    width: ${(props) => props.mobileWidth};
  `}
`;

const Content = styled.div<{ maxHeight: string; mobileMaxHeight: string }>`
  max-height: ${(props) => props.maxHeight};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 5px;
  margin-right: 5px;
  padding-left: 5px;
  padding-right: 5px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  ${media.smallerThanMaxTablet`
    max-height: ${(props) => props.mobileMaxHeight};
  `}
`;

export const DropdownListItem = styled.button`
  width: 100%;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  cursor: pointer;
  transition: all 80ms ease-out;

  &:hover,
  &:focus,
  &.selected {
    background: ${colors.clDropdownHoverBackground};
  }
`;

const Footer = styled.div`
  display: flex;
`;

interface Props {
  opened: boolean;
  width?: string;
  mobileWidth?: string;
  maxHeight?: string;
  mobileMaxHeight?: string;
  top?: string;
  left?: string;
  mobileLeft?: string;
  right?: string;
  mobileRight?: string;
  content: JSX.Element;
  footer?: JSX.Element;
  onClickOutside?: (event: FormEvent) => void;
  id?: string;
  className?: string;
}

interface State {}

export default class Dropdown extends PureComponent<Props, State> {
  dropdownElement: HTMLElement | null = null;

  static defaultProps = {
    width: '260px',
    mobileWidth: '200px',
    maxHeight: '320px',
    mobileMaxHeight: '280px',
    top: 'auto',
    left: 'auto',
    mobileLeft: 'auto',
    right: 'auto',
    mobileRight: 'auto',
  };

  componentWillUnmount() {
    if (this.dropdownElement) {
      this.dropdownElement.removeEventListener('wheel', this.scrolling);
    }
  }

  scrolling = (event: WheelEvent) => {
    // prevent body from scrolling
    if (this.dropdownElement) {
      const deltaY = event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY;
      this.dropdownElement.scrollTop += deltaY;
      event.preventDefault();
    }
  };

  setRef = (element: HTMLDivElement | null) => {
    if (element) {
      this.dropdownElement = element;
      this.dropdownElement.addEventListener('wheel', this.scrolling);
    }
  };

  close = (event: FormEvent) => {
    event.preventDefault();

    if (this.props.opened && this.props.onClickOutside) {
      this.props.onClickOutside(event);
    }
  };

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
      id,
      className,
    } = this.props;

    if (
      top &&
      left &&
      right &&
      mobileLeft &&
      mobileRight &&
      maxHeight &&
      mobileMaxHeight &&
      width &&
      mobileWidth
    ) {
      return (
        <CSSTransition
          in={opened}
          timeout={timeout}
          mountOnEnter={true}
          unmountOnExit={true}
          exit={false}
          classNames={`${className} dropdown`}
        >
          <Container
            id={id}
            top={top}
            left={left}
            mobileLeft={mobileLeft}
            right={right}
            mobileRight={mobileRight}
            closeOnClickOutsideEnabled={opened}
            onClickOutside={this.close}
            className={className}
          >
            <ContainerInner width={width} mobileWidth={mobileWidth}>
              <Content
                maxHeight={maxHeight}
                mobileMaxHeight={mobileMaxHeight}
                ref={this.setRef}
              >
                {content}
              </Content>

              {footer && <Footer>{footer}</Footer>}
            </ContainerInner>
          </Container>
        </CSSTransition>
      );
    }

    return null;
  }
}

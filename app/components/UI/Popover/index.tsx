// libraries
import React, { PureComponent } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';

// style
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

const Container = styled.div`
  /* width: 100%;
  height: 100%; */
  position: relative;
  display: flex;
  align-items: center;
  outline: none;

  * {
    outline: none;
    user-select: none;
  }
`;

const Content = styled(clickOutside) <{ offset: number }>`
  position: absolute;
  z-index: 4;

  ${media.biggerThanMaxTablet`
    &.bottom {
      top: ${({ offset }) => offset || '0'}px;
      left: 50%;
      transform-origin: top left;
    }

    &.top {
      bottom: ${({ offset }) => offset || '0'}px;
      left: 50%;
      transform-origin: bottom left;
    }

    &.top-left {
      bottom: ${({ offset }) => Math.round(offset / 1.5) || '0'}px;
      right: ${({ offset }) => Math.round(offset / 1.5) || '0'}px;
      transform-origin: bottom right;
    }

    &.bottom-left {
      top: ${({ offset }) => Math.round(offset / 1.5) || '0'}px;
      right: ${({ offset }) => Math.round(offset / 1.5) || '0'}px;
      transform-origin: top right;
    }

    &.left {
      right: ${({ offset }) => offset || '0'}px;
      transform-origin: bottom right;
    }

    &.right {
      left: ${({ offset }) => offset || '0'}px;
      transform-origin: bottom left;
    }
  `}

  ${media.smallerThanMaxTablet`
    &.small-bottom {
      top: ${({ offset }) => offset || '0'}px;
      left: 50%;
      transform-origin: top left;
    }

    &.small-top {
      bottom: ${({ offset }) => offset || '0'}px;
      left: 50%;
      transform-origin: bottom left;
    }

    &.small-top-left {
      bottom: ${({ offset }) => Math.round(offset / 1.1) || '0'}px;
      right: ${({ offset }) => Math.round(offset / 1.9) || '0'}px;
      transform-origin: bottom right;
    }

    &.small-bottom-left {
      top: ${({ offset }) => offset || '0'}px;
      right: 0px;
      transform-origin: top right;
    }

    &.small-left {
      right: ${({ offset }) => offset || '0'}px;
      transform-origin: bottom right;
    }

    &.small-right {
      left: ${({ offset }) => offset || '0'}px;
      transform-origin: bottom left;
    }
  `}

  &.dropdown-enter {
    opacity: 0;
    transform: scale(0.92);

    &.dropdown-enter-active {
      opacity: 1;
      transform: scale(1);
      transition: all 250ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

const ContentInner = styled.div<{
  backgroundColor: string,
  position?: IPosition,
  smallViewportPosition?: IPosition,
  borderColor?: string,
  textColor?: string
}>`
  position: relative;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
  border-radius: ${(props: any) => props.theme.borderRadius};
  background-color: ${({ backgroundColor }) => backgroundColor};
  border: solid 1px ${({ borderColor }) => borderColor || colors.separation};

  ${({ textColor }) => textColor ? `
    color: ${textColor};
    fill: ${textColor};
  ` : ''};

  ${media.biggerThanMinTablet`
    &.bottom, &.top {
      left: -50%;
    }

    &.withPin {
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
        left:  ${({ position }) => position === 'bottom-left' ? 'calc(100%-15px)' : '0'};
        right: 0;
        margin: 0 auto;
        border-color: transparent transparent ${(props: any) => props.backgroundColor} transparent;
        border-width: 10px;
      }

      ::before {
        top: -22px;
        left: ${({ position }) => position === 'bottom-left' ? 'calc(100%-15px)' : '0'};
        right: 0;
        margin: 0 auto;
        border-color: transparent transparent ${(props: any) => props.borderColor || colors.separation} transparent;
        border-width: 11px;
      }
    }
  `}

  ${media.smallerThanMinTablet`
    &.small-bottom, &.small-top {
      left: -50%;
    }

    &.withPin {
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
        left:  ${({ smallViewportPosition }) => smallViewportPosition === 'bottom-left' ? '75%' : '0'};
        right: 0;
        margin: 0 auto;
        border-color: transparent transparent ${(props: any) => props.backgroundColor} transparent;
        border-width: 10px;
      }

      ::before {
        top: -22px;
        left: ${({ smallViewportPosition }) => smallViewportPosition === 'bottom-left' ? '75%' : '0'};
        right: 0;
        margin: 0 auto;
        border-color: transparent transparent ${(props: any) => props.borderColor || colors.separation} transparent;
        border-width: 11px;
      }
    }
  `}


`;

export type IPosition = 'top' | 'left' | 'right' | 'bottom' | 'top-left' | 'bottom-left';

export interface Props {
  content: JSX.Element;
  offset: number;
  backgroundColor: string;
  onClickOutside: (event) => void;
  dropdownOpened: boolean;
  borderColor?: string;
  textColor?: string;
  className?: string;
  id?: string;
  withPin?: boolean; // all positions are not supported
  position?: IPosition;
  smallViewportPosition?: IPosition;
  // position defaults to right when undefined, smallViewportPosition default to position
}

/*
* children must be a button or link
*/

export default class Popover extends PureComponent<Props> {
  render() {
    const { onClickOutside, dropdownOpened, children, content, offset, withPin, textColor, backgroundColor, borderColor, className, id } = this.props;

    let { position, smallViewportPosition } = this.props;
    position = (position || 'right');
    smallViewportPosition = (smallViewportPosition || position);

    return (
      <Container className={`${className || ''} popover`}>
        <div className="tooltip-trigger">{children}</div>

        <CSSTransition
          in={dropdownOpened}
          timeout={200}
          mountOnEnter={true}
          unmountOnExit={true}
          classNames="dropdown"
          exit={false}
        >
          <Content
            onClickOutside={onClickOutside}
            offset={offset}
            className={`${position} small-${smallViewportPosition} tooltip-container`}
            role="tooltip"
          >
            <ContentInner
              id={id}
              backgroundColor={backgroundColor}
              textColor={textColor}
              borderColor={borderColor}
              className={`${position} small-${smallViewportPosition} tooltip-content ${withPin ? 'withPin' : ''}`}
              position={position}
              smallViewportPosition={smallViewportPosition}
            >
              {content}
            </ContentInner>
          </Content>
        </CSSTransition>
      </Container>
    );
  }
}

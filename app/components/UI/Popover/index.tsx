import React, { memo, useCallback } from 'react';
import { isBoolean } from 'lodash-es';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';

// style
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

const animationDuration = 250;

const Container = styled(clickOutside)`
  position: relative;
  display: flex;
  align-items: center;
`;

const Content = styled.div<{ offset: number }>`
  position: absolute;
  z-index: 4;
  transform-origin: center left;
  will-change: transform, opacity;

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

    &.bottom-right {
      top: ${({ offset }) => Math.round(offset / 1.5) || '0'}px;
      left: ${({ offset }) => Math.round(offset / 1.5) || '0'}px;
      transform-origin: top left;
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

    &.small-bottom-right {
      top: ${({ offset }) => offset || '0'}px;
      left: 0px;
      transform-origin: top left;
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
    transform: scale(0.96);

    &.dropdown-enter-active {
      opacity: 1;
      transform: scale(1);
      transition: all ${animationDuration}ms cubic-bezier(0.19, 1, 0.22, 1);
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
        right:  ${({ position }) => position === 'bottom-right' ? 'calc(100%-15px)' : '0'};
        margin: 0 auto;
        border-color: transparent transparent ${(props: any) => props.backgroundColor} transparent;
        border-width: 10px;
      }

      ::before {
        top: -22px;
        left: ${({ position }) => position === 'bottom-left' ? 'calc(100%-15px)' : '0'};
        right:  ${({ position }) => position === 'bottom-right' ? 'calc(100%-15px)' : '0'};
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
        left:  ${({ smallViewportPosition }) => smallViewportPosition === 'bottom-left' ? 'calc(100%-15px)' : '0'};
        right:  ${({ smallViewportPosition }) => smallViewportPosition === 'bottom-right' ? 'calc(100%-15px)' : '0'};
        margin: 0 auto;
        border-color: transparent transparent ${(props: any) => props.backgroundColor} transparent;
        border-width: 10px;
      }

      ::before {
        top: -22px;
        left: ${({ smallViewportPosition }) => smallViewportPosition === 'bottom-left' ? 'calc(100%-15px)' : '0'};
        right:  ${({ smallViewportPosition }) => smallViewportPosition === 'bottom-right' ? 'calc(100%-15px)' : '0'};
        margin: 0 auto;
        border-color: transparent transparent ${(props: any) => props.borderColor || colors.separation} transparent;
        border-width: 11px;
      }
    }
  `}
`;

export type IPosition = 'top' | 'left' | 'right' | 'bottom' | 'top-left' | 'bottom-left' | 'bottom-right';

export interface Props {
  children: JSX.Element;
  content: JSX.Element | null;
  offset?: number;
  backgroundColor?: string;
  onClickOutside?: (event) => void;
  onMouseEnter?: (event) => void;
  onMouseLeave?: (event) => void;
  onMouseDown?: (event) => void;
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

const Popover = memo<Props>(({
  onClickOutside,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  dropdownOpened,
  children,
  content,
  offset,
  withPin,
  position,
  smallViewportPosition,
  textColor,
  backgroundColor,
  borderColor,
  className,
  id
}) => {
  const finalOffset = (offset || 0);
  const finalBackgroundColor = (backgroundColor || '#fff');
  const finalWithPin = (isBoolean(withPin) ? withPin : true);
  const finalPosition = (position || 'right');
  const finalSmallViewportPosition = (smallViewportPosition || position);

  const handleOnMouseEnter = useCallback((event) => {
    onMouseEnter && onMouseEnter(event);
  }, [onMouseEnter]);

  const handleOnMouseLeave = useCallback((event) => {
    onMouseLeave && onMouseLeave(event);
  }, [onMouseLeave]);

  const handleOnClickOutside = useCallback((event) => {
    onClickOutside && onClickOutside(event);
  }, [onClickOutside]);

  const handleOnMouseDown = useCallback((event) => {
    onMouseDown && onMouseDown(event);
  }, [onMouseDown]);

  return (
    <Container
      className={`${className || ''} popover`}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      onMouseDown={handleOnMouseDown}
      onClickOutside={handleOnClickOutside}
    >
      <div className="tooltip-trigger">{children}</div>

      <CSSTransition
        classNames="dropdown"
        in={dropdownOpened}
        timeout={animationDuration}
        mountOnEnter={true}
        unmountOnExit={true}
        enter={true}
        exit={false}
      >
        <Content
          offset={finalOffset}
          className={`${finalPosition} small-${finalSmallViewportPosition} tooltip-container`}
          role="tooltip"
        >
          <ContentInner
            id={id}
            backgroundColor={finalBackgroundColor}
            textColor={textColor}
            borderColor={borderColor}
            className={`${finalPosition} small-${finalSmallViewportPosition} tooltip-content ${finalWithPin ? 'withPin' : ''}`}
            position={finalPosition}
            smallViewportPosition={finalSmallViewportPosition}
          >
            {content}
          </ContentInner>
        </Content>
      </CSSTransition>
    </Container>
  );
});

export default Popover;

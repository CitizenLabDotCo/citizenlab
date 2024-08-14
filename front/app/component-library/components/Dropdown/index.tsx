import React, { useEffect, useRef, FormEvent } from 'react';

import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import clickOutside from '../../utils/containers/clickOutside';
import { colors, fontSizes, media, isRtl } from '../../utils/styleUtils';

const timeout = 200;

interface ContainerProps {
  top: string;
  left: string;
  right: string;
  mobileLeft: string;
  mobileRight: string;
  zIndex: string;
}

const Container = styled(clickOutside)<ContainerProps>`
  border-radius: ${(props) => props.theme.borderRadius};
  background-color: #fff;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.18);
  z-index: ${(props) => props.zIndex};
  position: absolute;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  right: ${(props) => props.right};
  transition: none;

  ${isRtl`
    right: ${(props: ContainerProps) => props.left};
    left: ${(props: ContainerProps) => props.right};
  `}

  * {
    user-select: none;
  }

  ${media.phone`
    left: ${(props: ContainerProps) => props.mobileLeft};
    right: ${(props: ContainerProps) => props.mobileRight};
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

interface ContainerInnerProps {
  width: string;
  mobileWidth: string;
}

const ContainerInner = styled.div<ContainerInnerProps>`
  width: ${(props) => props.width};

  ${media.phone`
    width: ${(props: ContainerInnerProps) => props.mobileWidth};
  `}
`;

interface ContentProps {
  maxHeight: string;
  mobileMaxHeight: string;
}

const Content = styled.div<ContentProps>`
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

  ${media.phone`
    max-height: ${(props: ContentProps) => props.mobileMaxHeight};
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
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;
  transition: all 80ms ease-out;

  &:hover,
  &:focus,
  &.selected {
    background: ${colors.grey300};
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
  zIndex?: string;
  onClickOutside?: (event: FormEvent) => void;
  id?: string;
  className?: string;
}

const Dropdown: React.FC<Props> = ({
  opened,
  width = '260px',
  mobileWidth = '200px',
  maxHeight = '320px',
  mobileMaxHeight = '280px',
  top = 'auto',
  left = 'auto',
  mobileLeft = 'auto',
  right = 'auto',
  mobileRight = 'auto',
  content,
  footer,
  id,
  zIndex = '5',
  onClickOutside,
  className,
}) => {
  const dropdownElement = useRef<HTMLDivElement | null>(null);
  const triggerElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const scrolling = (event: WheelEvent) => {
      if (dropdownElement.current) {
        const deltaY = event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY;
        dropdownElement.current.scrollTop += deltaY;
        event.preventDefault();
      }
    };

    const currentElement = dropdownElement.current;
    if (currentElement) {
      currentElement.addEventListener('wheel', scrolling);
    }

    return () => {
      if (currentElement) {
        currentElement.removeEventListener('wheel', scrolling);
      }
    };
  }, []); // No dependencies, so it runs only on mount and unmount

  useEffect(() => {
    if (opened && dropdownElement.current) {
      const focusableElements =
        dropdownElement.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
      if (focusableElements.length > 0) {
        // Move focus to the first focusable element in the dropdown
        focusableElements[0].focus();
      }
    }

    if (!opened && triggerElement.current) {
      // Move focus back to the trigger element
      triggerElement.current.focus();
    }
  }, [opened]);

  const close = (event: FormEvent) => {
    event.preventDefault();
    if (opened && onClickOutside) {
      onClickOutside(event);
    }
  };

  return (
    <CSSTransition
      in={opened}
      timeout={timeout}
      mountOnEnter
      unmountOnExit
      exit={false}
      classNames={`${className} dropdown`}
      onEntering={() => {
        if (document.activeElement instanceof HTMLElement) {
          triggerElement.current = document.activeElement;
        }
      }}
    >
      <Container
        id={id}
        top={top}
        left={left}
        mobileLeft={mobileLeft}
        right={right}
        mobileRight={mobileRight}
        closeOnClickOutsideEnabled={opened}
        onClickOutside={close}
        zIndex={zIndex}
        className={className}
      >
        <ContainerInner width={width} mobileWidth={mobileWidth}>
          <Content
            maxHeight={maxHeight}
            mobileMaxHeight={mobileMaxHeight}
            ref={dropdownElement}
          >
            {content}
          </Content>
          {footer && <Footer>{footer}</Footer>}
        </ContainerInner>
      </Container>
    </CSSTransition>
  );
};

export default Dropdown;

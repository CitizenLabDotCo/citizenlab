import React, { useEffect, useRef, FormEvent } from 'react';

import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import ClickOutside from '../../utils/containers/clickOutside';
import { colors, fontSizes, media, isRtl } from '../../utils/styleUtils';

const timeout = 200;

const Container = styled(ClickOutside)<ContainerProps>`
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

const ContainerInner = styled.div<ContainerInnerProps>`
  width: ${(props) => props.width};

  ${media.phone`
    width: ${(props: ContainerInnerProps) => props.mobileWidth};
  `}
`;

const Content = styled.div<ContentProps>`
  max-height: ${(props) => props.maxHeight};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 10px 5px;
  padding: 0 5px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  ${media.phone`
    max-height: ${(props: ContentProps) => props.mobileMaxHeight};
  `}

  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.5);
    -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
  }
`;

export const DropdownListItem = styled.button`
  width: 100%;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  margin: 0;
  margin-bottom: 4px;
  padding: 10px;
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;
  transition: all 80ms ease-out;

  &:hover,
  &:focus,
  &.selected {
    background: ${colors.grey200};
  }

  &:disabled {
    color: ${colors.grey400};
    cursor: not-allowed;

    &:hover {
      background: transparent;
    }
  }
`;

const Footer = styled.div`
  display: flex;
`;

// Props interfaces
interface ContainerProps {
  top: string;
  left: string;
  right: string;
  mobileLeft: string;
  mobileRight: string;
  zIndex: string;
}

interface ContainerInnerProps {
  width: string;
  mobileWidth: string;
}

interface ContentProps {
  maxHeight: string;
  mobileMaxHeight: string;
}

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
  const dropdownContentRef = useRef<HTMLDivElement | null>(null);
  const nodeRef = useRef(null); // Needed to fix React StrictMode warning
  const footerRef = useRef<HTMLDivElement | null>(null);
  const triggerElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (dropdownContentRef.current) {
        const deltaY = event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY;
        dropdownContentRef.current.scrollTop += deltaY;
        event.preventDefault();
      }
    };

    const dropdownContent = dropdownContentRef.current;

    if (opened) {
      dropdownContent?.addEventListener('wheel', handleScroll);
    }

    return () => {
      dropdownContent?.removeEventListener('wheel', handleScroll);
    };
  }, [opened, footer]);

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
      // nodeRef used to fix React strict mode warning.
      // See: https://github.com/reactjs/react-transition-group/issues/668#issuecomment-695162879
      nodeRef={nodeRef}
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
            ref={dropdownContentRef}
          >
            {content}
          </Content>
          {footer && <Footer ref={footerRef}>{footer}</Footer>}
        </ContainerInner>
      </Container>
    </CSSTransition>
  );
};

export default Dropdown;

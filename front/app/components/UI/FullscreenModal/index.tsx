import React, { useEffect, useState } from 'react';

import { Color, colors } from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';

import useLocale from 'hooks/useLocale';

const slideInOutTimeout = 500;
const slideInOutEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';

const Container = styled.div<{
  windowHeight: number;
  windowWidth?: number;
  contentBgColor?: InputProps['contentBgColor'];
}>`
  position: fixed;
  display: flex;
  overflow: hidden;
  background: ${({ contentBgColor }) =>
    contentBgColor ? colors[contentBgColor] : colors.white};
  width: ${({ windowWidth }) => windowWidth}px; /* Fallback for width */
  @supports (width: 100dvw) {
    width: 100dvw; /* Dynamic viewport width for better mobile handling */
  }
  height: ${({ windowHeight }) => windowHeight}px; /* Fallback for height */
  @supports (height: 100dvh) {
    height: 100dvh; /* Dynamic viewport height for better mobile handling */
  }
  z-index: 1005; /* 1005 is needed to appear above the top main navigation */

  &.modal-enter {
    transform: translateY(100vh);

    &.modal-enter-active {
      transform: translateY(0px);
      transition: all ${slideInOutTimeout}ms ${slideInOutEasing};
    }
  }

  &.modal-exit {
    transform: translateY(0px);

    &.modal-exit-active {
      transform: translateY(100vh);
      transition: all ${slideInOutTimeout}ms ${slideInOutEasing};
    }
  }
`;

const StyledFocusOn = styled(FocusOn)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  transform: translate3d(0, 0, 0);
`;

const ModalBottomBar = styled.div`
  position: sticky;
  bottom: 0;
`;

interface InputProps {
  className?: string;
  opened: boolean;
  close: () => void;
  topBar?: JSX.Element | null;
  bottomBar?: JSX.Element | null;
  children: JSX.Element | null | undefined;
  contentBgColor?: Color;
}

interface Props extends InputProps {
  locale: SupportedLocale;
}

const FullscreenModal = ({
  className,
  opened,
  close,
  topBar,
  bottomBar,
  children,
  contentBgColor,
}: Props) => {
  const [windowDimensions, setWindowDimensions] = useState({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  });

  useEffect(() => {
    const handleOnResize = () => {
      setWindowDimensions({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
    };

    const handleKeypress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeypress);
    window.addEventListener('resize', handleOnResize);

    return () => {
      // subscription.unsubscribe();
      window.removeEventListener('keydown', handleKeypress);
      window.removeEventListener('resize', handleOnResize);
    };
  }, [close]);

  return (
    <CSSTransition
      classNames="modal"
      in={opened}
      timeout={{
        enter: slideInOutTimeout,
        exit: slideInOutTimeout,
      }}
      mountOnEnter={true}
      unmountOnExit={true}
      enter={true}
      exit={true}
    >
      <Container
        id="e2e-fullscreenmodal-content"
        className={[bottomBar ? 'hasBottomBar' : '', className].join()}
        windowHeight={windowDimensions.windowHeight}
        contentBgColor={contentBgColor}
      >
        <StyledFocusOn autoFocus>
          {topBar}
          <Content className="fullscreenmodal-scrollcontainer">
            {children}
          </Content>
          {bottomBar && <ModalBottomBar>{bottomBar}</ModalBottomBar>}
        </StyledFocusOn>
      </Container>
    </CSSTransition>
  );
};

export default (inputProps: InputProps) => {
  const locale = useLocale();
  const modalPortalElement = document.getElementById('modal-portal');

  return modalPortalElement
    ? createPortal(
        <FullscreenModal {...inputProps} locale={locale} />,
        modalPortalElement
      )
    : null;
};

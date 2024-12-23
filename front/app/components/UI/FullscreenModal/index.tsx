import React, { useEffect } from 'react';

import {
  Color,
  colors,
  useWindowSize,
  Box,
  Title,
  TitleProps,
} from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';

import modalMessages from 'components/UI/Modal/messages';

import CloseIconButton from '../CloseIconButton';

const slideInOutTimeout = 500;
const slideInOutEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';

const Container = styled.div<{
  windowHeight: number;
  windowWidth: number;
  contentBgColor?: Props['contentBgColor'];
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

interface Props {
  className?: string;
  opened: boolean;
  close: () => void;
  modalTitle?: JSX.Element | null;
  titleAs?: TitleProps['as'];
  titleVariant?: TitleProps['variant'];
  bottomBar?: JSX.Element | null;
  children: JSX.Element | null | undefined;
  contentBgColor?: Color;
}

const FullscreenModal = ({
  className,
  opened,
  close,
  modalTitle,
  titleAs,
  titleVariant,
  bottomBar,
  children,
  contentBgColor,
}: Props) => {
  const { windowWidth, windowHeight } = useWindowSize();

  useEffect(() => {
    const handleKeypress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeypress);

    return () => {
      window.removeEventListener('keydown', handleKeypress);
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
        windowHeight={windowHeight}
        windowWidth={windowWidth}
        contentBgColor={contentBgColor}
        aria-labelledby={modalTitle ? 'full-screen-modal-title' : undefined}
        aria-modal="true"
        role="dialog"
      >
        <StyledFocusOn autoFocus>
          {modalTitle && (
            <Box
              bgColor={colors.white}
              borderBottom={`1px solid ${colors.grey300}`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <Title
                id="full-screen-modal-title"
                as={titleAs || 'h2'}
                variant={titleVariant || 'h5'}
                m="0"
                p="16px"
                fontWeight="bold"
              >
                {modalTitle}
              </Title>
              <Box position="absolute" right="8px">
                <CloseIconButton
                  a11y_buttonActionMessage={modalMessages.closeWindow}
                  onClick={close}
                  iconColor={colors.textSecondary}
                  iconColorOnHover={colors.grey800}
                />
              </Box>
            </Box>
          )}
          <Content className="fullscreenmodal-scrollcontainer">
            {children}
          </Content>
          {bottomBar && <ModalBottomBar>{bottomBar}</ModalBottomBar>}
        </StyledFocusOn>
      </Container>
    </CSSTransition>
  );
};

export default (inputProps: Props) => {
  const modalPortalElement = document.getElementById('modal-portal');

  return modalPortalElement
    ? createPortal(<FullscreenModal {...inputProps} />, modalPortalElement)
    : null;
};

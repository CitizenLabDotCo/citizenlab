import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
  Box,
  media,
  colors,
  fontSizes,
  defaultOutline,
  viewportWidths,
  ClickOutside,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import CSSTransition from 'react-transition-group/CSSTransition';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import styled from 'styled-components';

import CloseIconButton from 'components/UI/CloseIconButton';

import { trackEventByName } from 'utils/analytics';
import eventEmitter from 'utils/eventEmitter';

import messages from './messages';
import tracks from './tracks';

const desktopOpacityTimeout = 500;
const mobileOpacityTimeout = 250;
const desktopTransformTimeout = 500;
const mobileTransformTimeout = 700;
const desktopTranslateY = '-200px';
const mobileTranslateY = '300px';
const desktopEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const mobileEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';

export const ModalContentContainer = styled.div<{
  padding?: string;
}>`
  flex: 1 1 auto;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: ${({ padding }) => padding || '30px'};

  ${media.phone`
    padding: ${({ padding }) => padding || '20px'};
  `}
`;

const StyledCloseIconButton = styled(CloseIconButton)`
  position: absolute;
  top: 12px;
  right: 24px;
  z-index: 2000;
  border-radius: 50%;
  border: solid 1px transparent;
  transition: all 100ms ease-out;
  outline: none !important;
  padding: 10px;

  &:hover {
    background: #e0e0e0;
  }

  &.focus-visible {
    ${defaultOutline};
  }

  ${isRtl`
    right: auto;
    left: 25px;
  `}

  ${media.phone`
    top: 13px;
    right: 15px;
  `}
`;

const StyledCloseIconButton2 = styled(CloseIconButton)`
  position: absolute;
  top: 17px;
  z-index: 2000;
  border-radius: 50%;
  border: solid 1px transparent;
  transition: all 100ms ease-out;
  outline: none !important;
  padding: 10px;
  right: 22px;

  ${media.phone`
    right: 6px;
  `}

  &:hover {
    background: #e0e0e0;
  }

  &.focus-visible {
    ${defaultOutline};
  }

  ${isRtl`
    right: auto;
    left: 25px;
  `}
`;

const StyledFocusOn = styled(FocusOn)<{
  width: number | string;
}>`
  width: 100%;
  max-width: ${({ width }) =>
    typeof width === 'string' ? width : `${width}px`};
  display: flex;
  justify-content: center;
`;

const ModalContainer = styled(ClickOutside)<{
  windowHeight: number;
}>`
  width: 100%;
  max-height: 85vh;
  margin-top: 50px;
  background: #fff;
  border-radius: ${({ theme }) => theme.borderRadius};
  display: flex;
  flex-direction: column;
  outline: none;
  overflow: hidden;
  padding: 0px;
  position: relative;

  &.fixedHeight {
    height: 100%;
    max-height: 600px;
  }

  @media (min-height: 1200px) {
    margin-top: 120px;
  }

  ${media.phone`
    max-width: calc(100vw - 30px);
    max-height: calc(${({ windowHeight }) => windowHeight}px - 30px);
    margin-top: 15px;

    &.fixedHeight {
      height: auto;
      max-height: 85vh;
    }
  `}
`;

const Overlay = styled.div<{ zIndex?: number }>`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  padding-left: 30px;
  padding-right: 30px;
  overflow: hidden;
  will-change: opacity, transform;

  z-index: ${({ zIndex }) =>
    zIndex !== undefined ? zIndex.toString() : '1000001'};

  ${media.phone`
    padding: 0px;
  `}

  &.modal-enter {
    opacity: 0;

    ${ModalContainer} {
      opacity: 1;
      transform: translateY(${desktopTranslateY});

      ${media.phone`
        transform: translateY(${mobileTranslateY});
      `}
    }

    &.modal-enter-active {
      opacity: 1;
      transition: opacity ${desktopOpacityTimeout}ms ${desktopEasing};

      ${media.phone`
        transition: opacity ${mobileOpacityTimeout}ms ${mobileEasing};
      `}

      ${ModalContainer} {
        opacity: 1;
        transform: translateY(0px);
        transition: opacity ${desktopOpacityTimeout}ms ${desktopEasing},
          transform ${desktopTransformTimeout}ms ${desktopEasing};

        ${media.phone`
          transition: opacity ${mobileOpacityTimeout}ms ${mobileEasing}, transform ${mobileTransformTimeout}ms ${mobileEasing};
        `}
      }
    }
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: solid 1px #e0e0e0;
  background: transparent;

  ${media.phone`
    padding-top: 15px;
    padding-bottom: 15px;
    padding-left: 20px;
    padding-right: 20px;
  `}
`;

const HeaderTitle = styled.h1`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  line-height: normal;
  margin: 0;
  margin-right: 45px;
  padding: 0;

  ${media.phone`
    margin-right: 35px;
  `}

  ${isRtl`
    text-align: right;
    margin: 0;
    margin-left: 45px;

    ${media.phone`
      margin-left: 35px;
    `}
  `}
`;

const FooterContainer = styled.div`
  width: 100%;
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 15px;
  padding-bottom: 15px;
  border-top: solid 1px ${colors.divider};
  background: #fff;

  ${media.phone`
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 20px;
    padding-right: 20px;
  `}
`;

const Skip = styled.div`
  color: #fff;
  font-size: ${fontSizes.base}px;
  text-align: center;
  text-decoration: underline;
  margin-top: 15px;
  cursor: pointer;

  ${media.tablet`
    display: none;
  `}
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;

  .Button {
    margin-right: 1rem;
    margin-bottom: 0.5rem;
  }
`;

export const Content = styled.p`
  font-size: ${fontSizes.base}px;
  line-height: ${fontSizes.xxl}px;
  margin-bottom: 30px;
`;

const ModalContentContainerSwitch = ({
  width,
  children,
}: {
  width: number | string;
  children: React.ReactNode;
}) => {
  return <StyledFocusOn width={width}>{children}</StyledFocusOn>;
};

interface Props {
  'data-testid'?: string;
  opened: boolean;
  fixedHeight?: boolean;
  width?: number | string;
  close: () => void;
  className?: string;
  header?: JSX.Element | string;
  niceHeader?: boolean;
  footer?: JSX.Element;
  hasSkipButton?: boolean;
  skipText?: JSX.Element;
  padding?: string;
  closeOnClickOutside?: boolean;
  children: React.ReactNode;
  zIndex?: number;
  hideCloseButton?: boolean;
  /**
   * Optional ref to return focus on close.
   * By default, focus returns to the control that opened the modal.
   * Use this ref if you want to return focus to another ref.
   */
  returnFocusRef?: React.RefObject<HTMLElement>;
}

const Modal: React.FC<Props> = ({
  'data-testid': dataTestId,
  opened,
  fixedHeight = false,
  width = 650,
  close,
  className,
  header,
  niceHeader,
  footer,
  hasSkipButton,
  skipText,
  padding,
  closeOnClickOutside = true,
  children,
  zIndex,
  hideCloseButton,
  returnFocusRef,
}) => {
  const nodeRef = useRef(null); // Needed to fix React StrictMode warning
  const [modalHasBeenOpened, setModalHasBeenOpened] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  });

  const handleResize = useCallback((event: Event) => {
    const target = event.target as Window;
    setWindowDimensions({
      windowWidth: target.innerWidth,
      windowHeight: target.innerHeight,
    });
  }, []);

  const handlePopstateEvent = useCallback(() => {
    close();
  }, [close]);

  const handleKeypress = useCallback(
    (event: KeyboardEvent) => {
      if (event.type === 'keydown' && event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    },
    [close]
  );

  const cleanup = useCallback(() => {
    window.removeEventListener('popstate', handlePopstateEvent);
    window.removeEventListener('keydown', handleKeypress);
    eventEmitter.emit('modalClosed');
  }, [handlePopstateEvent, handleKeypress]);

  useEffect(() => {
    if (opened) {
      setModalHasBeenOpened(true);
    }
  }, [opened]);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (modalHasBeenOpened && !opened && returnFocusRef?.current) {
      timeoutId = window.setTimeout(() => {
        returnFocusRef.current?.focus();
      }, 0);
    }

    // Cleanup function to clear the timeout on unmount
    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [opened, returnFocusRef, modalHasBeenOpened]);

  useEffect(() => {
    const subscription = fromEvent(window, 'resize')
      .pipe(debounceTime(50), distinctUntilChanged())
      .subscribe(handleResize);

    if (opened) {
      window.addEventListener('popstate', handlePopstateEvent);
      window.addEventListener('keydown', handleKeypress);
      eventEmitter.emit('modalOpened');
    }

    return () => {
      subscription.unsubscribe();
      cleanup();
    };
  }, [opened, handleResize, handlePopstateEvent, handleKeypress, cleanup]);

  const clickOutsideModal = useCallback(() => {
    if (closeOnClickOutside) {
      trackEventByName(tracks.clickOutsideModal);
      close();
    }
  }, [closeOnClickOutside, close]);

  const clickCloseButton = useCallback(
    (event: React.MouseEvent<any>) => {
      event.preventDefault();
      event.stopPropagation();
      trackEventByName(tracks.clickCloseButton);
      close();
    },
    [close]
  );

  const { windowHeight, windowWidth } = windowDimensions;
  const smallerThanSmallTablet = windowWidth <= viewportWidths.tablet;
  let calculatedPadding = padding;

  if (header !== undefined || footer !== undefined) {
    calculatedPadding = '0px';
  } else if (padding) {
    calculatedPadding = padding;
  }

  return width ? (
    <CSSTransition
      classNames="modal"
      data-testid={dataTestId}
      in={opened}
      timeout={
        smallerThanSmallTablet
          ? mobileTransformTimeout
          : desktopTransformTimeout
      }
      mountOnEnter
      nodeRef={nodeRef}
      unmountOnExit
      enter
      exit={false}
    >
      <Overlay
        ref={nodeRef}
        id="e2e-modal-container"
        className={className}
        zIndex={zIndex}
      >
        <ModalContentContainerSwitch width={width}>
          <ModalContainer
            className={`modalcontent ${fixedHeight ? 'fixedHeight' : ''}`}
            onClickOutside={clickOutsideModal}
            windowHeight={windowHeight}
            ariaLabelledBy={header ? 'modal-header' : undefined}
            aria-modal="true"
            role="dialog"
          >
            {!niceHeader && (
              <>
                {header && (
                  <HeaderContainer>
                    <HeaderTitle id="modal-header">{header}</HeaderTitle>
                  </HeaderContainer>
                )}

                {!hideCloseButton && (
                  <StyledCloseIconButton
                    className="e2e-modal-close-button"
                    onClick={clickCloseButton}
                    iconColor={colors.textSecondary}
                    iconColorOnHover={colors.grey800}
                    a11y_buttonActionMessage={messages.closeWindow}
                  />
                )}
              </>
            )}

            {header && niceHeader && (
              <>
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  w="100%"
                  py="8px"
                  borderBottom={`solid 1px ${colors.divider}`}
                >
                  <Box
                    w="100%"
                    h="100%"
                    display="flex"
                    alignItems="center"
                    minHeight="66px"
                  >
                    {header}
                  </Box>
                </Box>
                {!hideCloseButton && (
                  <Box mr={smallerThanSmallTablet ? '0px' : '8px'}>
                    <StyledCloseIconButton2
                      className="e2e-modal-close-button"
                      iconColor={colors.textSecondary}
                      iconColorOnHover={colors.black}
                      a11y_buttonActionMessage={messages.closeWindow}
                      onClick={clickCloseButton}
                    />
                  </Box>
                )}
              </>
            )}

            <ModalContentContainer padding={calculatedPadding}>
              {children}
            </ModalContentContainer>

            {footer && <FooterContainer>{footer}</FooterContainer>}

            {hasSkipButton && skipText && (
              <Skip onClick={clickCloseButton}>{skipText}</Skip>
            )}
          </ModalContainer>
        </ModalContentContainerSwitch>
      </Overlay>
    </CSSTransition>
  ) : null;
};

export default (props: Props) => {
  const modalPortalElement = document.getElementById('modal-portal');

  return modalPortalElement
    ? createPortal(<Modal {...props} />, modalPortalElement)
    : null;
};

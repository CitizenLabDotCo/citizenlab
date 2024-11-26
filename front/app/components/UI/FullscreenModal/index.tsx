import React, { PureComponent } from 'react';

import { Color, colors, media } from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import CSSTransition from 'react-transition-group/CSSTransition';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';

import useLocale from 'hooks/useLocale';

const slideInOutTimeout = 500;
const slideInOutEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';

const Container = styled.div<{
  windowHeight: number;
  contentBgColor?: InputProps['contentBgColor'];
}>`
  width: 100vw;
  height: ${({ windowHeight, theme }) =>
    `calc(${windowHeight}px - ${theme.menuHeight}px)`};
  position: fixed;
  top: ${({ theme }) => theme.menuHeight}px;
  left: 0;
  display: flex;
  overflow: hidden;
  background: ${({ contentBgColor }) =>
    contentBgColor ? colors[contentBgColor] : colors.white};
  z-index: 1003;

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

  ${(props) => media.tablet`
    height: 100vh;
    top: 0;
    bottom: ${props.theme.mobileMenuHeight}px;
    z-index: 1005; /* there is no top navbar at this screen size, so okay that it is higher than the z-index of NavBar here */

    &.hasBottomBar {
      height: ${props.windowHeight}px;
      bottom: 0;
    }
  `}
`;

const StyledFocusOn = styled(FocusOn)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow-y: auto;
`;

const Modal = styled.div<{ contentBgColor?: Color }>`
  position: fixed;
  inset: 0; /* Shorthand for top, right, bottom, left: 0 */
  display: flex;
  flex-direction: column;
  background: ${({ contentBgColor }) =>
    contentBgColor ? colors[contentBgColor] : colors.white};
  z-index: 100;
  overflow: hidden;

  height: 100vh; /* Fallback for height */
  @supports (height: 100dvh) {
    height: 100dvh; /* Dynamic viewport height for better mobile handling */
  }

  z-index: 10004;

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

const ModalTopBar = styled.div`
  position: sticky;
  top: 0;
  border-bottom: 1px solid #e0e0e0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ModalBottomBar = styled.div`
  position: sticky;
  bottom: 0;
  background: #f8f9fa;
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
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

interface State {
  windowHeight: number;
}

class FullscreenModal extends PureComponent<Props, State> {
  subscription: Subscription | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      windowHeight: window.innerHeight,
    };
  }

  componentDidMount() {
    this.subscription = fromEvent(window, 'resize')
      .pipe(debounceTime(50), distinctUntilChanged())
      .subscribe((event) => {
        if (event.target) {
          const height = event.target['innerHeight'] as number;
          this.setState({ windowHeight: height });
        }
      });
  }

  componentWillUnmount() {
    this.subscription?.unsubscribe();
  }

  render() {
    const { windowHeight } = this.state;
    const { children, opened, topBar, bottomBar, className, contentBgColor } =
      this.props;

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
        <Modal
          id="e2e-fullscreenmodal-content"
          className={[bottomBar ? 'hasBottomBar' : '', className].join()}
          // windowHeight={windowHeight}
          contentBgColor={contentBgColor}
        >
          <StyledFocusOn autoFocus>
            <ModalTopBar>{topBar}</ModalTopBar>
            <ModalContent
              className="fullscreenmodal-scrollcontainer"
              // flex="1"
              // overflowY="auto"
            >
              {children}
            </ModalContent>
            {bottomBar && (
              <ModalBottomBar
              // position="fixed"
              // w="100%"
              // h={`${stylingConsts.mobileTopBarHeight}px`}
              // bottom="0"
              // left="0"
              // padding="40px"
              // background="white"
              // display="flex"
              // alignItems="center"
              // borderTop={`1px solid ${colors.grey400}`}
              >
                {bottomBar}
              </ModalBottomBar>
            )}
          </StyledFocusOn>
        </Modal>
      </CSSTransition>
    );
  }
}

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

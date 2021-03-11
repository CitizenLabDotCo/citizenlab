import React, { PureComponent } from 'react';
import { createPortal } from 'react-dom';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isFunction, compact } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import CSSTransition from 'react-transition-group/CSSTransition';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { FocusOn } from 'react-focus-on';
import eventEmitter from 'utils/eventEmitter';

// resource
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// tracking
import { trackPage } from 'utils/analytics';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const slideInOutTimeout = 500;
const slideInOutEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';

const Container = styled.div<{ windowHeight: string }>`
  width: 100vw;
  height: ${(props) =>
    `calc(${props.windowHeight} - ${props.theme.menuHeight}px)`};
  position: fixed;
  top: ${({ theme }) => theme.menuHeight}px;
  left: 0;
  display: flex;
  overflow: hidden;
  background: #fff;
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

  ${media.smallerThanMaxTablet`
    height: ${(props) =>
      `calc(${props.windowHeight} - ${props.theme.mobileMenuHeight}px)`};
    top: 0;
    bottom: ${(props) => props.theme.mobileMenuHeight}px;
    z-index: 1005; /* there is no top navbar at this screen size, so okay that it is higher than the z-index of NavBar here */

    &.hasBottomBar {
      height: ${(props) => props.windowHeight};
      bottom: 0;
    }
  `}
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

interface InputProps {
  opened: boolean;
  close: () => void;
  url?: string | null;
  goBackUrl?: string | null;
  topBar?: JSX.Element | null;
  bottomBar?: JSX.Element | null;
  animateInOut?: boolean;
  navbarRef?: HTMLElement | null;
  mobileNavbarRef?: HTMLElement | null;
  children: JSX.Element | null | undefined;
}

interface DataProps {
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  windowHeight: string;
}

const useCapture = false;

class FullscreenModal extends PureComponent<Props, State> {
  subscription: Subscription | null = null;
  unlisten: Function | null = null;
  url: string | null | undefined = null;
  goBackUrl: string | null | undefined = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      windowHeight: `${window.innerHeight}px`,
    };
  }

  componentDidMount() {
    this.subscription = fromEvent(window, 'resize')
      .pipe(debounceTime(50), distinctUntilChanged())
      .subscribe((event) => {
        if (event.target) {
          const height = event.target['innerHeight'] as number;
          this.setState({ windowHeight: `${height}px` });
        }
      });
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.opened && this.props.opened) {
      this.openModal();
    } else if (prevProps.opened && !this.props.opened) {
      this.cleanup();
    }
  }

  componentWillUnmount() {
    this.subscription?.unsubscribe();
    this.cleanup();
  }

  openModal = () => {
    const { locale, url, goBackUrl } = this.props;

    if (!isNilOrError(locale) && url) {
      this.url = `${window.location.origin}/${locale}${
        removeLocale(url).pathname
      }`;
      this.goBackUrl = `${window.location.origin}/${locale}${
        removeLocale(goBackUrl || window.location.pathname).pathname
      }`;
      window.history.pushState({ path: this.url }, '', this.url);
      window.addEventListener('popstate', this.handlePopstateEvent, useCapture);
      window.addEventListener('keydown', this.handleKeypress, useCapture);
      this.unlisten = clHistory.listen(() => this.props.close());
      trackPage(this.url, { modal: true });
    }
  };

  handleKeypress = (event) => {
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault();
      this.props.close();
    }
  };

  handlePopstateEvent = () => {
    this.props.close();
  };

  cleanup = () => {
    if (this.goBackUrl) {
      window.removeEventListener(
        'popstate',
        this.handlePopstateEvent,
        useCapture
      );
      window.removeEventListener('keydown', this.handleKeypress, useCapture);

      if (window.location.href === this.url) {
        window.history.pushState({ path: this.goBackUrl }, '', this.goBackUrl);
      }
    }

    this.url = null;
    this.goBackUrl = null;

    if (isFunction(this.unlisten)) {
      this.unlisten();
      this.unlisten = null;
    }

    eventEmitter.emit('fullscreenModalClosed');
  };

  render() {
    const { windowHeight } = this.state;
    const {
      children,
      opened,
      topBar,
      bottomBar,
      animateInOut,
      navbarRef,
      mobileNavbarRef,
    } = this.props;
    const shards = compact([navbarRef, mobileNavbarRef]);
    const modalPortalElement = document?.getElementById('modal-portal');
    let modalContent: React.ReactChild | null = null;

    if (animateInOut || (!animateInOut && opened)) {
      modalContent = (
        <Container
          id="e2e-fullscreenmodal-content"
          className={bottomBar ? 'hasBottomBar' : ''}
          windowHeight={windowHeight}
        >
          <StyledFocusOn autoFocus={false} shards={shards}>
            {topBar}
            <Content className="fullscreenmodal-scrollcontainer">
              {children}
            </Content>
            {bottomBar}
          </StyledFocusOn>
        </Container>
      );
    }

    if (animateInOut) {
      return createPortal(
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
          {modalContent}
        </CSSTransition>,
        document.getElementById('modal-portal') as HTMLElement
      );
    }

    if (!animateInOut && opened && modalPortalElement) {
      return createPortal(modalContent, modalPortalElement);
    }

    return null;
  }
}

const Data = adopt<DataProps, {}>({
  locale: <GetLocale />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <FullscreenModal {...inputProps} {...dataProps} />}
  </Data>
);

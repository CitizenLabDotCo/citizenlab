import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isFunction } from 'lodash-es';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import clHistory from 'utils/cl-router/history';
import CSSTransition from 'react-transition-group/CSSTransition';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// tracking
import { trackPage } from 'utils/analytics';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const slideInOutTimeout = 500;
const slideInOutEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';

const Container = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.menuHeight}px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #fff;
  z-index: 997;

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
    top: 0;
    bottom: ${props => props.theme.mobileMenuHeight}px;
    z-index: 999;

    &.hasBottomBar {
      bottom: 0;
    }
  `}
`;

const Content = styled.div`
  flex: 1;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;

interface InputProps {
  opened: boolean;
  close: () => void;
  url?: string | null;
  goBackUrl?: string | null;
  topBar?: JSX.Element | null;
  bottomBar?: JSX.Element | null;
  animateInOut?: boolean;
  children: JSX.Element | null | undefined;
}

interface DataProps {
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

const useCapture = false;

class FullscreenModal extends PureComponent<Props, State> {
  unlisten: Function | null = null;
  url: string | null | undefined = null;
  goBackUrl: string | null | undefined = null;
  ContentElement: HTMLDivElement | null = null;

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.opened && this.props.opened) {
      this.openModal();
    } else if (prevProps.opened && !this.props.opened) {
      this.cleanup();
    }
  }

  componentWillUnmount() {
    this.cleanup();
  }

  openModal = () => {
    const { locale, url, goBackUrl } = this.props;

    if (!isNilOrError(locale) && url) {
      this.url = `${window.location.origin}/${locale}${removeLocale(url).pathname}`;
      this.goBackUrl = `${window.location.origin}/${locale}${removeLocale(goBackUrl || window.location.pathname).pathname}`;
      window.history.pushState({ path: this.url }, '', this.url);
      window.addEventListener('popstate', this.handlePopstateEvent, useCapture);
      window.addEventListener('keydown', this.handleKeypress, useCapture);
      this.unlisten = clHistory.listen(() => this.props.close());
      trackPage(this.url, { modal: true });
    }
  }

  handleKeypress = (event) => {
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault();
      this.props.close();
    }
  }

  handlePopstateEvent = () => {
    this.props.close();
  }

  cleanup = () => {
    if (this.goBackUrl) {
      window.removeEventListener('popstate', this.handlePopstateEvent, useCapture);
      window.removeEventListener('keydown', this.handleKeypress, useCapture);

      if (window.location.href === this.url) {
        window.history.pushState({ path: this.goBackUrl }, '', this.goBackUrl);
      }
    }

    this.url = null;
    this.goBackUrl = null;
    this.ContentElement = null;

    if (isFunction(this.unlisten)) {
      this.unlisten();
      this.unlisten = null;
    }

    clearAllBodyScrollLocks();
  }

  setRef = (element: HTMLDivElement) => {
    this.ContentElement = (element || null);

    if (this.ContentElement) {
      disableBodyScroll(this.ContentElement, {
        // @ts-ignore
        allowTouchMove: (element) => {
          while (element && element !== document.body) {
            if (element && element.className && element.className.includes('ignore-body-scroll-lock')) {
              return true;
            }

            // tslint:disable-next-line
            element = element.parentNode;
          }
        }
      });
    }
  }

  render() {
    const { children, opened, topBar, bottomBar, animateInOut } = this.props;

    if (animateInOut) {
      return ReactDOM.createPortal((
        <CSSTransition
          classNames="modal"
          in={opened}
          timeout={{
            enter: slideInOutTimeout,
            exit: slideInOutTimeout
          }}
          mountOnEnter={true}
          unmountOnExit={true}
          enter={true}
          exit={true}
        >
          <Container id="e2e-fullscreenmodal-content" className={bottomBar ? 'hasBottomBar' : ''}>
            {topBar}
            <Content ref={this.setRef}>
              {children}
            </Content>
            {bottomBar}
          </Container>
        </CSSTransition>
      ), document.getElementById('modal-portal') as HTMLElement);
    }

    if (!animateInOut && opened) {
      return ReactDOM.createPortal((
        <Container id="e2e-fullscreenmodal-content" className={bottomBar ? 'hasBottomBar' : ''}>
          {topBar}
          <Content ref={this.setRef}>
            {children}
          </Content>
          {bottomBar}
        </Container>
      ), document.getElementById('modal-portal') as HTMLElement);
    }

    return null;
  }
}

const Data = adopt<DataProps, {}>({
  locale: <GetLocale />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <FullscreenModal {...inputProps} {...dataProps} />}
  </Data>
);

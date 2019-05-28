import React, { PureComponent } from 'react';
import { isFunction } from 'lodash-es';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import clHistory from 'utils/cl-router/history';

// components
import TopBar from 'components/UI/TopBar';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// tracking
import { trackEventByName, trackPage } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { getUrlLocale } from 'services/locale';

const Container = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.menuHeight}px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  background: #fff;
  z-index: 998;

  ${media.smallerThanMaxTablet`
    top: 0;
  `}
`;

const Content = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 100%;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;

  ${media.smallerThanMaxTablet`
    height: calc(100vh - ${props => props.theme.mobileTopBarHeight}px - ${props => props.theme.mobileMenuHeight}px);
    margin-top: ${props => props.theme.mobileTopBarHeight}px;
  `}
`;

interface InputProps {
  opened: boolean;
  close: () => void;
  url: string | null;
  topbarContent?: JSX.Element | undefined;
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
  goBackUrl: string | null = null;
  ContentElement: HTMLDivElement | null = null;

  componentWillUnmount() {
    this.cleanup();
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.opened && this.props.opened) {
      this.openModal(this.props.url);
    } else if (prevProps.opened && !this.props.opened) {
      this.cleanup();
    }
  }

  openModal = (url: string | null) => {
    this.goBackUrl = window.location.href;

    window.addEventListener('popstate', this.handlePopstateEvent, useCapture);
    window.addEventListener('keydown', this.handleKeypress, useCapture);

    // on route change
    this.unlisten = clHistory.listen(() => {
      setTimeout(() => this.props.close(), 250);
    });

    // Add locale to the URL if it's not present yet
    let localizedUrl = url;
    const urlLocale = url && getUrlLocale(url);

    if (!urlLocale) {
      localizedUrl = `/${this.props.locale}${url}`;
    }

    if (localizedUrl) {
      window.history.pushState({ path: localizedUrl }, '', localizedUrl);
      trackPage(localizedUrl, { modal: true });
    }
  }

  handleKeypress = (event) => {
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
    }
  }

  closeModal = () => {
    if (this.props.url && this.goBackUrl && this.goBackUrl !== this.props.url) {
      window.history.pushState({ path: this.goBackUrl }, '', this.goBackUrl);
      this.props.close();
    }
  }

  handlePopstateEvent = () => {
    if (location.href === this.goBackUrl) {
      trackEventByName(tracks.clickBack, { extra: { url: this.props.url } });
    }

    this.props.close();
  }

  cleanup = () => {
    this.goBackUrl = null;
    this.ContentElement = null;

    window.removeEventListener('popstate', this.handlePopstateEvent, useCapture);
    window.removeEventListener('keydown', this.handleKeypress, useCapture);

    if (isFunction(this.unlisten)) {
      this.unlisten();
      this.unlisten = null;
    }

    clearAllBodyScrollLocks();
  }

  clickOutsideModal = () => {
    trackEventByName(tracks.clickOutsideModal, { extra: { url: this.props.url } });
    this.closeModal();
  }

  clickGoBackButton = () => {
    trackEventByName(tracks.clickCloseButton, { extra: { url: this.props.url } });
    this.closeModal();
  }

  setRef = (element: HTMLDivElement) => {
    this.ContentElement = (element || null);

    if (this.ContentElement) {
      disableBodyScroll(this.ContentElement, {
        // @ts-ignore
        allowTouchMove: (element) => {
          while (element && element !== document.body) {
            if (element.className.includes('ignore-body-scroll-lock')) {
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
    const { children, opened, topbarContent } = this.props;

    if (opened) {
      return (
        <Container id="e2e-fullscreenmodal-content">
          <Content ref={this.setRef}>
            {children}
          </Content>

          <TopBar goBack={this.clickGoBackButton}>
            {topbarContent}
          </TopBar>
        </Container>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetLocale>
    {locale => <FullscreenModal {...inputProps} locale={locale} />}
  </GetLocale>
);

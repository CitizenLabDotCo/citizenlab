import React, { PureComponent } from 'react';
import { isFunction } from 'lodash-es';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import clHistory from 'utils/cl-router/history';

// components
import TopBar from 'components/UI/Fullscreenmodal/TopBar';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// tracking
import { trackEventByName, trackPage } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { getUrlLocale } from 'services/locale';

const Container: any = styled.div`
  position: fixed;
  top: ${props => props.theme.menuHeight}px;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
  background: #fff;
  display: none;

  &.opened {
    z-index: 998;
    display: block;
  }

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
  headerChild?: JSX.Element | undefined;
  children: JSX.Element | null | undefined;
}

interface DataProps {
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

const useCapture = false;

class FullscreenModal extends PureComponent<Props, State> {
  unlisten: Function | null;
  goBackUrl: string | null;
  ContentElement: HTMLDivElement | null;

  constructor(props) {
    super(props);
    this.state = {
      scrolled: false
    };
    this.unlisten = null;
    this.goBackUrl = null;
    this.ContentElement = null;
  }

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

    disableBodyScroll(this.ContentElement);
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

    window.removeEventListener('popstate', this.handlePopstateEvent, useCapture);
    window.removeEventListener('keydown', this.handleKeypress, useCapture);

    // reset state
    this.setState({ scrolled: false });

    if (isFunction(this.unlisten)) {
      this.unlisten();
    }

    if (this.ContentElement) {
      this.ContentElement.scrollTop = 0;
    }

    enableBodyScroll(this.ContentElement);
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
  }

  render() {
    const { children, opened, headerChild } = this.props;

    return (
      <Container id="e2e-fullscreenmodal-content" className={`${opened ? 'opened' : 'closed'}`}>
        <Content innerRef={this.setRef}>
          {children}
        </Content>

        <TopBar goBack={this.clickGoBackButton}>
          {headerChild}
        </TopBar>
      </Container>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetLocale>
    {locale => <FullscreenModal {...inputProps} locale={locale} />}
  </GetLocale>
);

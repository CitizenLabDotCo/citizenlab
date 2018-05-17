import React from 'react';
import isFunction from 'lodash/isFunction';

// libraries
import { browserHistory } from 'react-router';

// components
import Icon from 'components/UI/Icon';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import { injectTracks, trackPage } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const timeout = 300;
const easing = `cubic-bezier(0.19, 1, 0.22, 1)`;

const Container: any = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  overflow: hidden;
  outline: none;
  background: #fff;
  z-index: -10000;
  transform: none;
  will-change: opacity;
  display: none;

  &.opened {
    z-index: 10000;
    display: block;
  }

  &.modal-enter {
    opacity: 0;

    &.modal-enter-active {
      opacity: 1;
      transition: opacity ${timeout}ms ${easing};
    }
  }

  ${media.smallerThanMaxTablet`
    will-change: opacity, transform;

    &.modal-enter {
      opacity: 0;
      transform: translateY(20px);

      &.modal-enter-active {
        opacity: 1;
        transform: translateY(0);
        transition: all ${timeout}ms ${easing};
      }
    }
  `}

  &.modal-exit {
    display: none;
  }
`;

const Content = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  ${media.smallerThanMaxTablet`
    height: calc(100vh - ${props => props.theme.mobileTopBarHeight}px - ${props => props.theme.mobileMenuHeight}px);
    margin-top: ${props => props.theme.mobileTopBarHeight}px;
  `}
`;

const ContentInner = styled.div`
  width: 100%;
`;

const TopBar: any = styled.div`
  height: ${props => props.theme.mobileTopBarHeight}px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: solid 1px #e0e0e0;
  z-index: 10002;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const TopBarInner = styled.div`
  height: 100%;
  padding-left: 30px;
  padding-right: 30px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const GoBackIcon = styled(Icon)`
  height: 22px;
  fill: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: fill 100ms ease-out;
`;

const GoBackButton = styled.div`
  height: 43px;
  width: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  margin-left: -2px;
  cursor: pointer;
  background: #fff;
  border-radius: 50%;
  border: solid 1px #e0e0e0;
  transition: all 100ms ease-out;

  &:hover {
    border-color: #000;

    ${GoBackIcon} {
      fill: #000;
    }
  }
`;

const GoBackLabel = styled.div`
  color: #666;
  font-size: 15px;
  font-weight: 400;
  transition: fill 100ms ease-out;

  ${media.phone`
    display: none;
  `}
`;

const GoBackButtonWrapper = styled.div`
  height: 48px;
  align-items: center;
  display: none;

  ${media.smallerThanMaxTablet`
    display: flex;
  `}
`;

const HeaderChildWrapper = styled.div`
  display: inline-block;
`;

const CloseIcon = styled(Icon)`
  height: 13px;
  fill: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: fill 100ms ease-out;
`;

const CloseButton = styled.div`
  height: 52px;
  width: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  cursor: pointer;
  top: 20px;
  right: 33px;
  border-radius: 50%;
  border: solid 1px #ccc;
  z-index: 10002;
  transition: border-color 100ms ease-out;

  &:hover {
    border-color: #000;

    ${CloseIcon} {
      fill: #000;
    }
  }

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

interface ITracks {
  clickCloseButton: (arg: any) => void;
  clickOutsideModal: (arg: any) => void;
  clickBack: (arg: any) => void;
}

type Props = {
  opened: boolean;
  close: () => void;
  url: string | null;
  headerChild?: JSX.Element | undefined;
};

type State = {};

class Modal extends React.PureComponent<Props & ITracks, State> {
  unlisten: Function | null;
  goBackUrl: string | null;
  ModalContentInnerElement: HTMLDivElement | null;

  constructor(props: Props & ITracks) {
    super(props);
    this.state = {
      scrolled: false
    };
    this.unlisten = null;
    this.goBackUrl = null;
    this.ModalContentInnerElement = null;
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

  disableBodyScroll = () => {
    if (!document.body.classList.contains('modal-active')) {
      document.body.classList.add('modal-active');
    }
  }

  enableBodyScroll = () => {
    document.body.classList.remove('modal-active');
  }

  openModal = (url: string | null) => {
    this.goBackUrl = window.location.href;

    window.addEventListener('popstate', this.handlePopstateEvent);
    window.addEventListener('keydown', this.onEscKeyPressed, true);

    this.disableBodyScroll();

    // on route change
    this.unlisten = browserHistory.listen(() => {
      setTimeout(() => this.props.close(), 250);
    });

    if (url) {
      window.history.pushState({ path: url }, '', url);
      trackPage(url, { modal: true });
    }
  }

  onEscKeyPressed = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    switch (event.key) {
      case 'Escape':
        this.manuallyCloseModal();
        break;
      default:
        return;
    }

    event.preventDefault();
  }

  manuallyCloseModal = () => {
    if (this.props.url && this.goBackUrl) {
      window.history.pushState({ path: this.goBackUrl }, '', this.goBackUrl);
    }

    this.props.close();
  }

  handlePopstateEvent = () => {
    if (location.href === this.goBackUrl) {
      this.props.clickBack({ extra: { url: this.props.url } });
    }

    this.props.close();
  }

  cleanup = () => {
    this.goBackUrl = null;

    this.enableBodyScroll();

    window.removeEventListener('popstate', this.handlePopstateEvent);
    window.removeEventListener('keydown', this.onEscKeyPressed, true);

    // reset state
    this.setState({ scrolled: false });

    if (isFunction(this.unlisten)) {
      this.unlisten();
    }

    if (this.ModalContentInnerElement) {
      this.ModalContentInnerElement.scrollTop = 0;
    }
  }

  clickOutsideModal = () => {
    this.props.clickOutsideModal({ extra: { url: this.props.url } });
    this.manuallyCloseModal();
  }

  clickCloseButton = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.clickCloseButton({ extra: { url: this.props.url } });
    this.manuallyCloseModal();
  }

  setRef = (element: HTMLDivElement) => {
    this.ModalContentInnerElement = (element || null);
  }

  render() {
    const { children, opened, headerChild } = this.props;

    return (
      <CSSTransition
        classNames="modal"
        in={opened}
        timeout={timeout}
        mountOnEnter={false}
        unmountOnExit={false}
        exit={true}
      >
        <Container id="e2e-fullscreenmodal-content" className={`${opened && 'opened'}`}>
          <Content innerRef={this.setRef}>
            <ContentInner>
              {children}
            </ContentInner>
          </Content>

          <CloseButton onClick={this.clickCloseButton}>
            <CloseIcon name="close4" />
          </CloseButton>

          <TopBar>
            <TopBarInner>
              <GoBackButtonWrapper>
                <GoBackButton onClick={this.clickCloseButton}>
                  <GoBackIcon name="arrow-back" />
                </GoBackButton>
                <GoBackLabel>
                  <FormattedMessage {...messages.goBack} />
                </GoBackLabel>
              </GoBackButtonWrapper>
              {headerChild && <HeaderChildWrapper>{headerChild}</HeaderChildWrapper>}
            </TopBarInner>
          </TopBar>
        </Container>
      </CSSTransition>
    );
  }
}

export default injectTracks<Props>(tracks)(Modal);

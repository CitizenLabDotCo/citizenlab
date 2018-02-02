import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { browserHistory } from 'react-router';

// components
import Icon from 'components/UI/Icon';

// animations
import TransitionGroup from 'react-transition-group/TransitionGroup';
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

const foregroundTimeout = 350;
const foregroundEasing = `cubic-bezier(0.19, 1, 0.22, 1)`;

const contentTimeout = 700;
const contentEasing = `cubic-bezier(0.000, 0.700, 0.000, 1.000)`;
const contentDelay = 450;
const contentTranslate = '25px';

const ModalBackground = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  flex-direction: column;
  outline: none;
  overflow: hidden;
  border-radius: 0px;
  background: #fff;
  z-index: 10000;
  will-change: opacity;

  &.foreground-enter {
    opacity: 0;

    &.foreground-enter-active {
      opacity: 1;
      transition: opacity ${foregroundTimeout}ms ${foregroundEasing};
    }
  }
`;

const ModalContentInner = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;

  ${media.smallerThanMaxTablet`
    height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - 70px);
    margin-top: 70px;
  `}
`;

const TopBar: any = styled.div`
  height: 70px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #f8f8f8;
  border-bottom: solid 1px #e0e0e0;

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
  height: 45px;
  width: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  margin-left: -2px;
  cursor: pointer;
  border-radius: 50%;
  border: solid 1px #e0e0e0;
  background: transparent;
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

  ${media.smallPhone`
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

const ModalContent: any = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  overflow: hidden;
  outline: none;
  background: transparent;
  z-index: 10001;
  will-change: opacity, transform;

  &.content-enter {
    opacity: 0;
    transform: translateY(${contentTranslate});

    &.content-enter-active {
      opacity: 1;
      transform: translateY(0);
      transition: all ${contentTimeout}ms ${contentEasing} ${contentDelay}ms;
    }
  }
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

type State = {
  scrolled: boolean;
};

class Modal extends React.PureComponent<Props & ITracks, State> {
  unlisten: Function | null;
  goBackUrl: string | null;
  keydownEventListener: any;
  subscription: Rx.Subscription | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      scrolled: false
    };
    this.unlisten = null;
    this.goBackUrl = null;
    this.subscription = null;
  }

  componentWillUnmount() {
    this.cleanup();
  }

  componentWillUpdate(nextProps: Props) {
    const { opened } = this.props;

    if (!opened && nextProps.opened) {
      this.openModal(nextProps.url);
    }

    if (opened && !nextProps.opened) {
      this.cleanup();
    }
  }

  openModal = (url: string| null) => {
    this.goBackUrl = window.location.href;
    window.addEventListener('popstate', this.handlePopstateEvent);
    window.addEventListener('keydown', this.onEscKeyPressed, true);
    this.unlisten = browserHistory.listen(this.props.close);

    if (!document.body.classList.contains('modal-active')) {
      document.body.classList.add('modal-active');
    }

    if (url) {
      window.history.pushState({ path: url }, '', url);

      // Since we bypass the normal history mechanism and take it into our own hands here,
      // we exceptionally also need to track the page change manually
      // Don't try this at home!
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
    document.body.classList.remove('modal-active');
    window.removeEventListener('popstate', this.handlePopstateEvent);
    window.removeEventListener('keydown', this.onEscKeyPressed, true);

    // reset state
    this.setState({ scrolled: false });

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (_.isFunction(this.unlisten)) {
      this.unlisten();
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

  render() {
    const { scrolled } = this.state;
    const { children, opened, headerChild } = this.props;

    return (
      <TransitionGroup>
        {opened &&
          <CSSTransition
            classNames="foreground"
            key={1}
            timeout={foregroundTimeout}
            mountOnEnter={true}
            unmountOnExit={true}
            exit={false}
          >
            <ModalBackground />
          </CSSTransition>
        }

        {opened &&
          <CSSTransition
            classNames="content"
            key={2}
            timeout={contentTimeout + contentDelay}
            mountOnEnter={true}
            unmountOnExit={true}
            exit={false}
          >
            <ModalContent id="e2e-fullscreenmodal-content">

              <ModalContentInner>
                {children}
              </ModalContentInner>

              <TopBar scrolled={scrolled}>
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

              <CloseButton onClick={this.clickCloseButton}>
                <CloseIcon name="close4" />
              </CloseButton>

            </ModalContent>
          </CSSTransition>
        }
      </TransitionGroup>
    );
  }
}

export default injectTracks<Props>(tracks)(Modal);

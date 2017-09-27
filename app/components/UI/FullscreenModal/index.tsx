import * as React from 'react';
import * as _ from 'lodash';
import { browserHistory } from 'react-router';

// components
import Icon from 'components/UI/Icon';

// animations
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// analytics
import { injectTracks, trackPage } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const backgroundTimeout = 100;
const backgroundEasing = `cubic-bezier(0.19, 1, 0.22, 1)`;

const foregroundTimeout = 500;
// const foregroundEasing = `cubic-bezier(1, 0, 0, 1)`;
// const foregroundEasing = `cubic-bezier(0.165, 0.84, 0.44, 1)`;
// const foregroundEasing = `cubic-bezier(0.19, 1, 0.22, 1)`;
const foregroundEasing = `cubic-bezier(0.23, 1, 0.32, 1)`;

const contentTimeout = 600;
const contentEasing = `cubic-bezier(0.19, 1, 0.22, 1)`;
const contentDelay = 300;

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 0;
  margin: 0;
  outline: none;
  overflow: hidden;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.6);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: opacity;

  &.background-enter {
    opacity: 0;

    &.background-enter-active {
      opacity: 1;
      transition: opacity ${backgroundTimeout}ms ${backgroundEasing};
    }
  }
`;

const ModalForeground: any = styled.div`
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
  background: #fff;
  z-index: 3000;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  &.foreground-enter {
    width: ${(props: any) => props.initialWidth + 'px' || 'auto'};
    height: ${(props: any) => props.initialHeight + 'px' || 'auto'};
    top: ${(props: any) => props.initialOffsetTop + 'px' || 0};
    bottom: ${(props: any) => props.initialOffsetBottom + 'px' || 0};
    left: ${(props: any) => props.initialOffsetLeft + 'px' || 0};
    right: ${(props: any) => props.initialOffsetRight + 'px' || 0};
    border-radius: 6px;
    /* box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.1); */

    &.foreground-enter-active {
      width: 100%;
      height: 100%;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      border-radius: 0px;
      transition: all ${foregroundTimeout}ms ${foregroundEasing};
    }
  }
`;

const ModalContentInner = styled.div`
  width: 100vw;
  height: 100vw;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  position: relative;
  background: transparent;
  z-index: 5000;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: opacity, transform;
`;

const ModalContent = styled.div`
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
  z-index: 4000;

  &.content-enter ${ModalContentInner} {
    opacity: 0.01;
    /* transform: translateY(-50px); */
  }

  &.content-enter.content-enter-active ${ModalContentInner} {
    opacity: 1;
    transform: translateY(0);
    transition: all ${contentTimeout}ms ${contentEasing} ${contentDelay}ms;
  }
`;

const CloseIcon = styled(Icon)`
  height: 18px;
  fill: #666;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CloseButton = styled.div`
  height: 35px;
  width: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  cursor: pointer;
  top: 15px;
  right: 15px;
  z-index: 2000;
  border-radius: 50%;
  border: solid 1px #e5e5e5;

  &:hover {
    border-color: #333;

    ${CloseIcon} {
      fill: #333;
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
  url?: string;
  initialWidth?: number | null | undefined;
  initialHeight?: number | null | undefined;
  initialOffsetTop?: number | null | undefined;
  initialOffsetBottom?: number | null | undefined;
  initialOffsetLeft?: number | null | undefined;
  initialOffsetRight?: number | null | undefined;
};

type State = {
  showModalContent: boolean
};

class Modal extends React.PureComponent<Props & ITracks, State> {
  state: State;
  private unlisten: Function | null;
  private goBackUrl: string | null;

  constructor() {
    super();
    this.state = {
      showModalContent: false
    };
    this.unlisten = null;
    this.goBackUrl = null;
  }

  componentWillUnmount() {
    this.cleanup();
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    const { opened } = this.props;

    if (!opened && nextProps.opened) {
      this.openModal(nextProps.url);
      setTimeout(() => this.setState({ showModalContent: true }), foregroundTimeout);
    }

    if (opened && !nextProps.opened) {
      this.cleanup();
    }
  }

  openModal = (url: undefined | string) => {
    this.goBackUrl = window.location.href;

    window.addEventListener('popstate', this.handlePopstateEvent);

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
    this.setState({ showModalContent: false });

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
    const { 
      children, 
      opened, 
      initialWidth, 
      initialHeight, 
      initialOffsetTop, 
      initialOffsetBottom, 
      initialOffsetLeft, 
      initialOffsetRight 
    } = this.props;

    const { showModalContent } = this.state;

    const modalBackground = (opened ? (
      <CSSTransition classNames="background" timeout={backgroundTimeout} exit={false}>
        <ModalBackground /> 
      </CSSTransition>
    ) : null);

    const modalForeground = (opened ? (
      <CSSTransition classNames="foreground" timeout={foregroundTimeout} exit={false}>
        <ModalForeground
          initialWidth={initialWidth}
          initialHeight={initialHeight}
          initialOffsetTop={initialOffsetTop}
          initialOffsetBottom={initialOffsetBottom}
          initialOffsetLeft={initialOffsetLeft}
          initialOffsetRight={initialOffsetRight}
        />
      </CSSTransition>
    ) : null);

    const modalContent = (opened ? (
      <CSSTransition classNames="content" timeout={contentTimeout} exit={false}>
        <ModalContent>
          <ModalContentInner>
            {children}
            <CloseButton onClick={this.clickCloseButton}>
              <CloseIcon name="close2" />
            </CloseButton>
          </ModalContentInner>
        </ModalContent>
      </CSSTransition>
    ) : null);

    return (
      <div>
        <TransitionGroup>
          {modalBackground}
          {modalForeground}
          {modalContent}
        </TransitionGroup>
      </div>
    );
  }
}

export default injectTracks<Props>(tracks)(Modal);

import * as React from 'react';
import * as _ from 'lodash';

// libraries
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

const foregroundTimeout = 200;
const foregroundEasing = `cubic-bezier(0.19, 1, 0.22, 1)`;

const contentTimeout = 700;
const contentEasing = `cubic-bezier(0.000, 0.700, 0.000, 1.000)`;
const contentDelay = 350;
const contentTranslate = '25px';

const ModalForeground: any = styled.div`
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
  z-index: 3000;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
  will-change: opacity;

  &.foreground-enter {
    opacity: 0;
  }

  &.foreground-enter.foreground-enter-active {
    opacity: 1;
    transition: all ${foregroundTimeout}ms ${foregroundEasing};
  }
`;

const ModalContentInner = styled.div`
  width: 100vw;
  height: 100%;
  overflow: hidden;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  z-index: 5000;
`;

const ModalContentInnerInner = styled.div`
  position: relative;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
  will-change: transform, opacity;
`;

const CloseIcon = styled(Icon)`
  height: 12px;
  fill: #999;
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
  right: 30px;
  border-radius: 50%;
  border: solid 1px #e0e0e0;
  z-index: 15000;
  transition: border-color 100ms ease-out;

  &:hover {
    border-color: #000;

    ${CloseIcon} {
      fill: #000;
    }
  }
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
  z-index: 4000;

  &.content-enter {
    ${ModalContentInnerInner} {
      opacity: 0;
      transform: translateY(${contentTranslate});

      ${media.smallerThanMaxTablet`
        padding-top: 20px;
      `}
    }
  }

  &.content-enter.content-enter-active {
    ${ModalContentInnerInner}  {
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
  url?: string;
};

type State = {};

class Modal extends React.PureComponent<Props & ITracks, State> {
  private unlisten: Function | null;
  private goBackUrl: string | null;
  private keydownEventListener: any;

  constructor() {
    super();
    this.unlisten = null;
    this.goBackUrl = null;
  }


  componentDidMount() {
    window.addEventListener('keydown', this.onEscKeyPressed, true);
  }

  componentWillUnmount() {
    this.cleanup();
  }

  componentWillUpdate(nextProps: Props, nextState: State) {
    const { opened } = this.props;

    if (!opened && nextProps.opened) {
      this.openModal(nextProps.url);
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
    const { children, opened } = this.props;

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
            <ModalForeground />
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
                <ModalContentInnerInner>
                  {children}
                </ModalContentInnerInner>
              </ModalContentInner>
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

import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import FocusTrap from 'focus-trap-react';
import eventEmitter from 'utils/eventEmitter';
import { Subscription } from 'rxjs';

// components
import Icon from 'components/UI/Icon';
import clickOutside from 'utils/containers/clickOutside';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// Translation
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';
import { hideVisually } from 'polished';

const enterTimeout = 450;
const enterDelay = 0;
const exitTimeout = 450;
const exitDelay = 0;
const easing = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

const ModalContainer = styled(clickOutside)`
  width: 940px;
  height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  outline: none;
  overflow: hidden;
  position: absolute;
  top: 0;
  right: 0;
  will-change: opacity, transform;
`;

const CloseIcon = styled(Icon)`
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  fill: ${colors.label};
  z-index: 2;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 35px;
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;

  &:hover,
  &:focus {
    ${CloseIcon} {
      fill: #000;
    }
  }

  ${media.smallerThanMinTablet`
    height: 18px;
    width: 18px;
  `}
`;

const Overlay = styled(FocusTrap)`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  overflow: hidden;
  z-index: 1000000;
  will-change: opacity;

  &.modal-enter {
    opacity: 0;

    ${ModalContainer} {
      opacity: 0;
      transform: translateX(940px);
    }

    &.modal-enter-active {
      opacity: 1;
      transition: all ${enterTimeout}ms ${easing} ${enterDelay}ms;

      ${ModalContainer} {
        opacity: 1;
        transform: translateX(0px);
        transition: all ${enterTimeout}ms ${easing} ${enterDelay}ms;
      }
    }
  }

  &.modal-enter-done {
    ${CloseButton} {
      opacity: 1;
    }
  }

  &.modal-exit {
    opacity: 1;

    ${ModalContainer} {
      opacity: 1;
      transform: translateX(0px);
    }

    ${CloseButton} {
      opacity: 0;
    }

    &.modal-exit-active {
      opacity: 1;
      transition: opacity ${exitTimeout}ms ${easing} ${exitDelay}ms;

      ${ModalContainer} {
        opacity: 1;
        transform: translateX(940px);
        transition: all ${exitTimeout}ms ${easing} ${exitDelay}ms;
      }
    }
  }
`;

const ModalContent = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`;

const HiddenSpan = styled.span`${hideVisually()}`;

type Props = {
  opened: boolean;
  close: () => void;
  className?: string;
  label?: string;
  children?: any;
};

type State = {
  innerModalOpened: boolean
};

export default class SideModal extends PureComponent<Props, State> {
  private el: HTMLDivElement;
  private ModalPortal = document.getElementById('modal-portal');
  private ModalContentElement: HTMLDivElement | null;
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      innerModalOpened: false
    };
    this.el = document.createElement('div');
    this.ModalContentElement = null;
    this.subscriptions = [];
  }

  componentDidMount() {
    if (!this.ModalPortal) {
      console.log('There was no Portal to insert the modal. Please make sure you have a Portal root');
    } else {
      this.ModalPortal.appendChild(this.el);
    }

    if (this.props.opened) {
      this.openModal();
    }

    this.subscriptions = [
      eventEmitter.observeEvent('modalOpened').subscribe(() => {
        this.setState({ innerModalOpened: true });
      }),
      eventEmitter.observeEvent('modalClosed').subscribe(() => {
        this.setState({ innerModalOpened: false });
      })
    ];
  }

  componentWillUnmount() {
    if (this.props.opened) {
      this.cleanup();
    }

    if (!this.ModalPortal) {
      console.log('There was no Portal to insert the modal. Please make sure you have a Portal root');
    } else {
      this.ModalPortal.removeChild(this.el);
    }

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.opened && this.props.opened) {
      this.openModal();
    } else if (prevProps.opened && !this.props.opened) {
      this.cleanup();
    }
  }

  openModal = () => {
    setTimeout(() => disableBodyScroll(this.ModalContentElement), 500);
  }

  manuallyCloseModal = () => {
    this.props.close();
  }

  cleanup = () => {
    enableBodyScroll(this.ModalContentElement);
  }

  clickOutsideModal = () => {
    this.props.close();
  }

  clickCloseButton = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.close();
  }

  setContentRef = (element: HTMLDivElement) => {
    this.ModalContentElement = (element || null);
  }

  render() {
    const { children, opened, label } = this.props;

    return ReactDOM.createPortal((
      <CSSTransition
        classNames="modal"
        in={opened}
        timeout={{
          enter: enterTimeout + enterDelay,
          exit: exitTimeout + exitDelay
        }}
        mountOnEnter={true}
        unmountOnExit={true}
        enter={true}
        exit={true}
      >
        <Overlay
          id="e2e-modal-container"
          className={this.props.className}
          aria-modal="true"
          role="dialog"
          aria-label={label}
        >
          <ModalContainer
            onClickOutside={this.manuallyCloseModal}
            closeOnClickOutsideEnabled={!this.state.innerModalOpened}
          >
            <ModalContent id="e2e-side-modal-content" ref={this.setContentRef}>
              {children}
            </ModalContent>
          </ModalContainer>

          <CloseButton
            className="e2e-modal-close-button"
            onClick={this.clickCloseButton}
          >
            <HiddenSpan>
              <FormattedMessage {...messages.closeButtonAria} />
            </HiddenSpan>
            <CloseIcon name="close" />
          </CloseButton >
        </Overlay>
      </CSSTransition>
    ), document.body);
  }
}

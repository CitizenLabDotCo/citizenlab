import React from 'react';
import ReactDOM from 'react-dom';
// import { isFunction, isBoolean, isString } from 'lodash-es';
// import clHistory from 'utils/cl-router/history';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import FocusTrap from 'focus-trap-react';

// components
import Icon from 'components/UI/Icon';
import clickOutside from 'utils/containers/clickOutside';

// animations
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// Translation
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';
import { hideVisually } from 'polished';

const timeout = 300;
const easing = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

const ModalContainer: any = styled(clickOutside)`
  width: 920px;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  outline: none;
  overflow: hidden;
  position: absolute;
  right: 0;
`;

const Overlay = styled(FocusTrap)`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: rgba(0, 0, 0, 0.75);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1000000;
  will-change: opacity, transform;

  &.modal-enter {
    opacity: 0;

    ${ModalContainer} {
      opacity: 0;
      width: 0px;
    }

    &.modal-enter-active {
      opacity: 1;
      transition: opacity ${timeout}ms ${easing};

      ${ModalContainer} {
        opacity: 1;
        width: 920px;
        transition: opacity ${timeout}ms ${easing},
                    width ${timeout}ms ${easing};
      }
    }
  }

  &.modal-exit {
    opacity: 1;

    ${ModalContainer} {
      opacity: 1;
      width: 920px;
    }

    &.modal-exit-active {
      opacity: 0;
      transition: opacity ${timeout}ms ${easing};

      ${ModalContainer} {
        opacity: 0;
        width: 150px;
        transition: opacity ${timeout}ms ${easing},
                    width ${timeout}ms ${easing};
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

const CloseIcon = styled(Icon)`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  fill: ${colors.mediumGrey};
  z-index: 2;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;

  &:hover,
  &:focus,
  &:active {
    ${CloseIcon} {
      fill: #000;
    }
  }

  ${media.smallerThanMinTablet`
    height: 18px;
    width: 18px;
  `}
`;

const HiddenSpan = styled.span`${hideVisually()}`;

type Props = {
  opened: boolean;
  close: () => void;
  className?: string;
  label?: string;
  children?: any;
};

type State = {};

export default class SideModal extends React.PureComponent<Props, State> {
  private el: HTMLDivElement;
  private ModalPortal = document.getElementById('modal-portal');
  private ModalContentElement: HTMLDivElement | null;
  private ModalCloseButton: HTMLButtonElement | null;

  constructor(props: Props) {
    super(props);
    this.el = document.createElement('div');
    this.ModalContentElement = null;
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
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.opened && this.props.opened) {
      this.openModal();
    } else if (prevProps.opened && !this.props.opened) {
      this.cleanup();
    }
  }

  openModal = () => {
    disableBodyScroll(this.ModalContentElement);

    if (this.ModalCloseButton) {
      this.ModalCloseButton.focus();
    }
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

  setCloseButtonRef = (element: HTMLButtonElement) => {
    this.ModalCloseButton = (element || null);
  }

  setContentRef = (element: HTMLDivElement) => {
    this.ModalContentElement = (element || null);
  }

  onOpen = () => {
    if (this.ModalCloseButton) {
      this.ModalCloseButton.focus();
    }
  }

  render() {
    const { children, opened, label } = this.props;

    const element = (opened ? (
      <CSSTransition
        classNames="modal"
        in={opened}
        timeout={timeout}
        mountOnEnter={true}
        unmountOnExit={true}
      >
        <Overlay
          id="e2e-modal-container"
          className={this.props.className}
          aria-modal="true"
          role="dialog"
          aria-label={label}
        >
          <ModalContainer
            onClickOutside={this.clickOutsideModal}
          >
            <CloseButton
              className="e2e-modal-close-button"
              onClick={this.clickCloseButton}
              innerRef={this.setCloseButtonRef}
            >
              <HiddenSpan>
                <FormattedMessage {...messages.closeButtonAria} />
              </HiddenSpan>
              <CloseIcon name="close3" />
            </CloseButton >

            <ModalContent
              innerRef={this.setContentRef}
            >
              {children}
            </ModalContent>
          </ModalContainer>
        </Overlay>
      </CSSTransition>
    ) : undefined);

    return ReactDOM.createPortal(
      <TransitionGroup
        tabIndex="-1"
        component="aside"
      >
        {element}
      </TransitionGroup>,
      document.body
    );
  }
}

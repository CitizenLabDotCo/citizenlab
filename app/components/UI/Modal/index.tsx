import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { isFunction } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import FocusTrap from 'focus-trap-react';
import eventEmitter from 'utils/eventEmitter';

// components
import Icon from 'components/UI/Icon';
import clickOutside from 'utils/containers/clickOutside';

// animations
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

const timeout = 400;
const easing = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

const ModalContent = styled.div`
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
`;

const CloseIcon = styled(Icon)`
  width: 100%;
  height: 100%;
  fill: ${colors.mediumGrey};
`;

const CloseButton = styled.button`
  width: 18px;
  height: 18px;
  position: absolute;
  top: 27px;
  right: 35px;
  cursor: pointer;
  outline: none;
  margin: 0;
  padding: 0;

  &:hover,
  &:focus,
  &:active {
    ${CloseIcon} {
      fill: #000;
    }
  }

  ${media.smallerThanMinTablet`
    width: 14px;
    height: 14px;
    top: 19px;
    right: 24px;
  `}
`;

const ModalContainer: any = styled(clickOutside)`
  width: 100%;
  max-width: ${(props: any) => props.width};
  background: white;
  border-radius: ${(props: any) => props.theme.borderRadius};
  display: flex;
  flex-direction: column;
  outline: none;
  overflow: hidden;
  padding: ${(props: any) => props.hasHeaderOrFooter ? 0 : '40px'};
  position: relative;

  &.fixedHeight {
    height: 600px;
  }

  ${media.smallerThanMinTablet`
    width: 100%;
    height: auto;
    max-width: 100vw;
    max-height: 100vh;

    &.fixedHeight {
      height: auto;
    }
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
  display: flex;
  background: rgba(0, 0, 0, 0.75);
  flex-direction: column;
  align-items: center;
  padding: 30px;
  padding-top: 50px;
  padding-bottom: 60px;
  overflow: hidden;
  z-index: 1000000;
  will-change: opacity, transform;

  ${media.biggerThanMinTablet`
    justify-content: center;
  `}

  ${media.smallerThanMinTablet`
    padding: 15px;
    padding-top: 30px;
    padding-bottom: 80px;
  `}

  &.modal-enter {
    opacity: 0;

    ${ModalContainer} {
      opacity: 0;
      transform: translateY(-40px);
    }

    &.modal-enter-active {
      opacity: 1;
      transition: opacity ${timeout}ms ${easing};

      ${ModalContainer} {
        opacity: 1;
        transform: translateY(0px);
        transition: opacity ${timeout}ms ${easing},
                    transform ${timeout}ms ${easing};
      }
    }
  }
`;

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: solid 1px ${colors.separation};
  background: #fff;

  ${media.smallerThanMinTablet`
    padding-top: 15px;
    padding-bottom: 15px;
    padding-left: 20px;
    padding-right: 20px;
  `}
`;

const HeaderTitle = styled.h1`
  color: ${colors.text};
  font-size: ${fontSizes.xxl}px;
  font-weight: 600;
  line-height: normal;
  margin: 0;
  margin-right: 45px;
  padding: 0;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.large}px;
    margin-right: 35px;
  `}
`;

const FooterContainer = styled.div`
  width: 100%;
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 15px;
  padding-bottom: 15px;
  border-top: solid 1px ${colors.separation};
  background: #fff;

  ${media.smallerThanMinTablet`
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 20px;
    padding-right: 20px;
  `}
`;

const Skip = styled.div`
  color: #fff;
  font-size: ${fontSizes.base}px;
  text-align: center;
  text-decoration: underline;
  margin-top: 15px;
  cursor: pointer;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

export const Spacer = styled.div`
  flex: 1;
`;

 export type Props = {
  opened: boolean;
  fixedHeight?: boolean;
  width?: string;
  close: () => void;
  className?: string;
  header?: JSX.Element;
  footer?: JSX.Element;
  hasSkipButton?: boolean;
  skipText?: JSX.Element;
  label?: string;
  children?: any;
  closeOnClickOutside?: boolean;
};

type State = {};

export default class Modal extends PureComponent<Props, State> {
  private unlisten: Function | null;
  private goBackUrl: string | null;
  private el: HTMLDivElement;
  private ModalPortal = document.getElementById('modal-portal');
  private ModalContentElement: HTMLDivElement | null;
  private ModalCloseButton: HTMLButtonElement | null;

  static defaultProps = {
    fixedHeight: false,
    width: '650px'
  };

  constructor(props: Props) {
    super(props);
    this.unlisten = null;
    this.goBackUrl = null;
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
    this.goBackUrl = window.location.href;

    window.addEventListener('popstate', this.handlePopstateEvent);
    disableBodyScroll(this.ModalContentElement);

    eventEmitter.emit('modal', 'modalOpened', null);

    this.unlisten = clHistory.listen(this.props.close);

    if (this.ModalCloseButton) {
      this.ModalCloseButton.focus();
    }
  }

  manuallyCloseModal = () => {
    this.props.close();
    eventEmitter.emit('modal', 'modalClosed', null);
  }

  handlePopstateEvent = () => {
    if (location.href === this.goBackUrl) {
      trackEventByName(tracks.clickBack);
    }

    this.props.close();
  }

  cleanup = () => {
    this.goBackUrl = null;
    window.removeEventListener('popstate', this.handlePopstateEvent);
    enableBodyScroll(this.ModalContentElement);

    if (isFunction(this.unlisten)) {
      this.unlisten();
    }
  }

  clickOutsideModal = () => {
    if (this.props.closeOnClickOutside !== false) {
      trackEventByName(tracks.clickOutsideModal);
      this.manuallyCloseModal();
    }
  }

  clickCloseButton = (event) => {
    event.preventDefault();
    event.stopPropagation();
    trackEventByName(tracks.clickCloseButton);
    this.manuallyCloseModal();
  }

  setCloseButtonRef = (element: HTMLButtonElement) => {
    this.ModalCloseButton = (element || null);
  }

  setContentRef = (element: HTMLDivElement) => {
    this.ModalContentElement = (element || null);
  }

  onOpen = () => {
    this.setState({ isOpen: true }, () => {
      if (this.ModalCloseButton) {
        this.ModalCloseButton.focus();
      }
    });
  }

  render() {
    const { fixedHeight, width, children, opened, header, footer, hasSkipButton, skipText, label } = this.props;

    return ReactDOM.createPortal((
      <CSSTransition
        classNames="modal"
        in={opened}
        timeout={timeout}
        mountOnEnter={true}
        unmountOnExit={true}
        exit={false}
      >
        <Overlay
          id="e2e-modal-container"
          className={this.props.className}
          aria-modal="true"
          role="dialog"
          aria-label={label}
        >
          <ModalContainer
            className={`modalcontent ${fixedHeight ? 'fixedHeight' : ''}`}
            width={width}
            onClickOutside={this.clickOutsideModal}
            hasHeaderOrFooter={header !== undefined || footer !== undefined}
          >
            <CloseButton
              className="e2e-modal-close-button"
              onClick={this.clickCloseButton}
              ref={this.setCloseButtonRef}
            >
              <CloseIcon name="close" />
            </CloseButton >

            {header &&
              <HeaderContainer>
                <HeaderTitle>{header}</HeaderTitle>
              </HeaderContainer>
            }

            <ModalContent
              ref={this.setContentRef}
            >
              {children}
            </ModalContent>
            <Spacer />

            {footer && <FooterContainer>{footer}</FooterContainer>}

            {hasSkipButton && skipText &&
              <Skip onClick={this.clickCloseButton}>{skipText}</Skip>
            }
          </ModalContainer>
        </Overlay>
      </CSSTransition>
    ),
      document.body
    );
  }
}

import React from 'react';
import ReactDOM from 'react-dom';
import { isFunction, isBoolean, isString } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

// components
import Icon from 'components/UI/Icon';
import clickOutside from 'utils/containers/clickOutside';

// animations
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// analytics
import { injectTracks, trackPage } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

const ModalContent: any = styled(clickOutside)`
  width: 100%;
  max-width: ${(props: any) => props.width};
  background: ${(props: any) => props.hasHeaderOrFooter ? colors.background : 'white' };
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  outline: none;
  overflow-y: ${(props: any) => props.hasHeaderOrFooter ? 'hidden' : 'auto'};
  -webkit-overflow-scrolling: touch;
  padding: ${(props: any) => props.hasHeaderOrFooter ? 0 : '40px'};
  position: relative;

  &.fixedHeight {
    height: 600px;
  }

  ${media.smallerThanMaxTablet`
    padding: ${(props: any) => props.hasHeaderOrFooter ? 0 : '25px'};

    &.fixedHeight {
      height: 80vh;
    }
  `}
`;

const CloseIcon = styled(Icon)`
  height: 20px;
  fill: ${colors.mediumGrey};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CloseButton = styled.div`
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  cursor: pointer;
  top: 20px;
  right: 20px;

  ${media.smallerThanMaxTablet`
    top: 10px;
    right: 10px;
  `}

  &:hover {
    svg {
      fill: ${colors.clBlueDark};
    }
  }
`;

const ModalContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  padding: 30px;
  overflow: hidden;
  z-index: 1000000;
  will-change: opacity, transform;

  ${media.smallerThanMaxTablet`
    padding: 20px;
    /* height: calc(100vh - ${props => props.theme.mobileMenuHeight}px); */
    /* bottom: auto; */
  `}

  &.modal-enter {
    opacity: 0;

    ${ModalContent} {
      opacity: 0;
      transform: translateY(-40px);
    }

    &.modal-enter-active {
      opacity: 1;
      transition: opacity 350ms cubic-bezier(0.165, 0.84, 0.44, 1);

      ${ModalContent} {
        opacity: 1;
        transform: translateY(0px);
        transition: opacity 350ms cubic-bezier(0.165, 0.84, 0.44, 1),
                    transform 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
      }
    }
  }
`;

const HeaderContainer = styled.div`
  background: white;
  width: 100%;
  height: 74px;
  border-bottom: 2px solid ${colors.separation};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 40px;
`;

const FooterContainer = styled(HeaderContainer)`
  background: white;
  border-bottom: none;
  border-top: 2px solid ${colors.separation};
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

interface ITracks {
  clickCloseButton: (arg: any) => void;
  clickOutsideModal: (arg: any) => void;
  clickBack: (arg: any) => void;
}

type Props = {
  opened: boolean;
  url?: string | undefined;
  fixedHeight?: boolean | undefined;
  width?: string | undefined;
  close: () => void;
  className?: string;
  header?: JSX.Element;
  footer?: JSX.Element;
  hasSkipButton?: boolean;
  skipText?: JSX.Element;
};

type State = {};

class Modal extends React.PureComponent<Props & ITracks, State> {
  private unlisten: Function | null;
  private goBackUrl: string | null;
  private el: HTMLDivElement;
  private ModalPortal = document.getElementById('modal-portal');
  private ModalContentElement: HTMLDivElement | null;

  constructor(props: Props & ITracks) {
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
      this.openModal(this.props.url);
    }
  }

  componentWillUnmount() {
    this.cleanup();

    if (!this.ModalPortal) {
      console.log('There was no Portal to insert the modal. Please make sure you have a Portal root');
    } else {
      this.ModalPortal.removeChild(this.el);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.opened && this.props.opened) {
      this.openModal(this.props.url);
    } else if (prevProps.opened && !this.props.opened) {
      this.cleanup();
    }
  }

  openModal = (url: undefined | string) => {
    this.goBackUrl = window.location.href;

    window.addEventListener('popstate', this.handlePopstateEvent);

    disableBodyScroll(this.ModalContentElement);

    this.unlisten = clHistory.listen(this.props.close);

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
      clHistory.push(this.goBackUrl);
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
    window.removeEventListener('popstate', this.handlePopstateEvent);
    enableBodyScroll(this.ModalContentElement);

    if (isFunction(this.unlisten)) {
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

  setRef = (element: HTMLDivElement) => {
    this.ModalContentElement = (element || null);
  }

  render() {
    let { fixedHeight, width } = this.props;
    const { children, opened, header, footer, hasSkipButton, skipText } = this.props;

    fixedHeight = (isBoolean(fixedHeight) ? fixedHeight : true);
    width = (isString(width) ? width : '650px');

    const element = (opened ? (
      <CSSTransition classNames="modal" timeout={350} exit={false}>
        <ModalContainer id="e2e-modal-container" className={this.props.className}>
          <ModalContent
            className={`modalcontent ${fixedHeight && 'fixedHeight'}`}
            width={width}
            onClickOutside={this.clickOutsideModal}
            hasHeaderOrFooter={header !== undefined || footer !== undefined}
            innerRef={this.setRef}
          >
            {header && <HeaderContainer> {header} </HeaderContainer>}
            {children}
            {footer && <FooterContainer> {footer} </FooterContainer>}
            <CloseButton onClick={this.clickCloseButton}>
              <CloseIcon name="close3" />
            </CloseButton>
          </ModalContent>

          {hasSkipButton && skipText &&
            <Skip onClick={this.clickCloseButton}>{skipText}</Skip>
          }
        </ModalContainer>
      </CSSTransition>
    ) : null);

    return ReactDOM.createPortal(
      <TransitionGroup>
        {element}
      </TransitionGroup>,
      this.el,
    );
  }
}

export default injectTracks<Props>(tracks)(Modal);

import React from 'react';
import ReactDOM from 'react-dom';
import { isFunction, isBoolean, isString } from 'lodash';
import { browserHistory } from 'react-router';

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
import { media, color } from 'utils/styleUtils';

const ModalContent: any = styled(clickOutside)`
  background: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  max-width: ${(props: any) => props.width};
  outline: none;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: ${(props: any) => props.hasHeaderOrFooter ? 0 : '40px'};
  position: relative;
  width: 100%;

  &.fixedHeight {
    height: 78vh;
  }

  ${media.smallerThanMaxTablet`
    padding: 25px;

    &.fixedHeight {
      height: 75vh;
    }
  `}
`;

const CloseIcon = styled(Icon)`
  height: 20px;
  fill: ${color('mediumGrey')};
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
      fill: ${color('clBlue')};
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
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  padding: 30px;
  overflow: hidden;
  z-index: 10002;

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
  width: 100%;
  height: 74px;
  border-bottom: 2px solid #EAEAEA;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 40px;
`;
const FooterContainer = styled(HeaderContainer)`
  border-bottom: none;
  border-top: 2px solid #EAEAEA;
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
};

type State = {};

class Modal extends React.PureComponent<Props & ITracks, State> {
  private unlisten: Function | null;
  private goBackUrl: string | null;
  private el: HTMLDivElement;
  private ModalPortal = document.getElementById('modal-portal');

  constructor(props: Props & ITracks) {
    super(props);
    this.unlisten = null;
    this.goBackUrl = null;
    this.el = document.createElement('div');
  }

  componentDidMount() {
    if (!this.ModalPortal) {
      console.log('There was no Portal to insert the modal. Please make sure you have a Portal root');
    } else {
      this.ModalPortal.appendChild(this.el);
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

  render() {
    let { fixedHeight, width } = this.props;
    const { children, opened, header, footer } = this.props;

    fixedHeight = (isBoolean(fixedHeight) ? fixedHeight : true);
    width = (isString(width) ? width : '650px');

    const element = (opened ? (
      <CSSTransition classNames="modal" timeout={350} exit={false}>
        <ModalContainer id="e2e-modal-container" className={this.props.className}>
          <ModalContent
            className={`${fixedHeight && 'fixedHeight'}`}
            width={width}
            onClickOutside={this.clickOutsideModal}
            hasHeaderOrFooter={header !== undefined || footer !== undefined}
          >
            {header &&
              <HeaderContainer> {header} </HeaderContainer>
            }
            {children}
            {footer &&
              <FooterContainer> {footer} </FooterContainer>
            }
            <CloseButton onClick={this.clickCloseButton}>
              <CloseIcon name="close3" />
            </CloseButton>
          </ModalContent>
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

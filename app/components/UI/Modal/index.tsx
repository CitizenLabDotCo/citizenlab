import * as React from 'react';
import { isFunction } from 'lodash';
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

const ModalContent = styled(clickOutside)`
  backface-visibility: hidden;
  background: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  flex: 1 1 100vw;
  height: auto;
  max-height: 75vh;
  max-width: 650px;
  outline: none;
  overflow-y: auto;
  padding: 40px;
  will-change: opacity, transform;

  ${media.biggerThanPhone`
    flex-grow: 0;
    flex-basis: 600px;

    &.fixedHeight {
      height: 75vh;
      max-height: auto;
  `}
`;

const CloseIcon = styled(Icon)`
  height: 20px;
  fill: #fff;
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

  &:hover {
    ${CloseIcon} {
      fill: #ccc;
    }
  }
`;

const ModalContainer = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, .7);
  bottom: 0;
  color: ${color('text')};
  display: flex;
  height: 100vh;
  justify-content: center;
  left: 0;
  max-height: 100%;
  padding: 30px;
  position: fixed;
  right: 0;
  top: 0;
  width: 100vw;
  will-change: opacity;
  z-index: 10001;

  ${media.phone`
    padding: 0px;
  `}

    &.modal-enter {
      opacity: 0.01;
      will-change: opacity;

      ${ModalContent} {
        opacity: 0.01;
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

interface ITracks {
  clickCloseButton: (arg: any) => void;
  clickOutsideModal: (arg: any) => void;
  clickBack: (arg: any) => void;
}

type Props = {
  opened: boolean;
  url?: string;
  fixedHeight?: boolean;
  close: () => void;
};

type State = {};

class Modal extends React.PureComponent<Props & ITracks, State> {
  private unlisten: Function | null;
  private goBackUrl: string | null;

  constructor(props: Props) {
    super(props as any);
    this.unlisten = null;
    this.goBackUrl = null;
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
    let { fixedHeight } = this.props;
    const { children, opened } = this.props;

    fixedHeight = (fixedHeight || true);

    const element = (opened ? (
      <CSSTransition classNames="modal" timeout={350} exit={false}>
        <ModalContainer id="e2e-modal-container">
          <ModalContent onClickOutside={this.clickOutsideModal} className={`${fixedHeight && 'fixedHeight'}`}>
            {children}
          </ModalContent>
          <CloseButton onClick={this.clickCloseButton}>
            <CloseIcon name="close3" />
          </CloseButton>
        </ModalContainer>
      </CSSTransition>
    ) : null);

    return (
      <TransitionGroup>
        {element}
      </TransitionGroup>
    );
  }
}

export default injectTracks<Props>(tracks)(Modal);

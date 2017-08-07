import * as React from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';
import styled from 'styled-components';

const ModalContent = styled(clickOutside)`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  padding: 25px;
  margin-top: 80px;
  margin-bottom: 80px;
  border-radius: 8px;
  background: #fff;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  -webkit-backface-visibility: hidden;
  will-change: auto;
`;

const ModalContainer = styled.div`
  max-height: 100%;
  padding-left: 30px;
  padding-right: 30px;
  z-index: 4;
  position: fixed;
  top: 0;
  right: 0;
  bottom: -200px;
  left: 0;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.45);
  -webkit-backface-visibility: hidden;
  will-change: auto;

  &.modal-enter {
    opacity: 0.01;
    will-change: opacity;

    ${ModalContent} {
      opacity: 0.01;
      transform: translateY(-100px);
      will-change: opacity, transform;
    }

    &.modal-enter-active {
      opacity: 1;
      transition: all 400ms cubic-bezier(0.165, 0.84, 0.44, 1);

      ${ModalContent} {
        opacity: 1;
        transform: translateY(0px);
        transition: all 400ms cubic-bezier(0.165, 0.84, 0.44, 1);
      }
    }
  }

  &.modal-exit {
    opacity: 1;
    will-change: opacity;

    ${ModalContent} {
      opacity: 1;
      transform: translateY(0px);
      will-change: opacity, transform;
    }

    &.modal-exit-active {
      opacity: 0.01;
      transition: all 400ms cubic-bezier(0.165, 0.84, 0.44, 1);

      ${ModalContent} {
        opacity: 0.01;
        transform: translateY(-100px);
        transition: all 400ms cubic-bezier(0.165, 0.84, 0.44, 1);
      }
    }
  }
`;

const CloseButton = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 600;
  line-height: 16px;
  padding: 12px 20px;
  position: absolute;
  border-radius: 5px;
  background: #e0e0e0;
  display: inline-block;
  cursor: pointer;
  top: 20px;
  right: 20px;
  z-index: 1;

  &:hover {
    background: #ccc;
  }
`;

type Props = {
  children: any;
  opened: boolean;
  parentUrl?: string;
  url?: string;
  close: () => void;
};

type State = {};

export default class Modal extends React.PureComponent<Props, State> {
  componentWillUnmount() {
    this.onClose();
  }

  componentWillUpdate(nextProps, nextState) {
    const { opened } = this.props;

    if (!opened && nextProps.opened) {
      this.onOpen();
    }

    if (opened && !nextProps.opened) {
      this.onClose();
    }
  }

  onOpen = () => {
    window.addEventListener('popstate', this.handlePopstateEvent);

    if (!document.body.classList.contains('modal-active')) {
      document.body.classList.add('modal-active');
    }

    if (this.props.parentUrl && this.props.url) {
      window.history.pushState({ path: this.props.url }, '', this.props.url);
    }
  }

  onClose = () => {
    document.body.classList.remove('modal-active');
    window.removeEventListener('popstate', this.handlePopstateEvent);

    if (this.props.parentUrl && this.props.url) {
      window.history.pushState({ path: this.props.parentUrl }, '', this.props.parentUrl);
    }
  }

  handlePopstateEvent = () => {
    if (location.href === this.props.parentUrl) {
      this.closeModal();
    }
  }

  closeModal = () => {
    this.props.close();
  }

  render() {
    const { children, opened, parentUrl, url } = this.props;

    const element = opened && (
      <CSSTransition classNames="modal" timeout={400}>
        <ModalContainer>
          <ModalContent onClickOutside={this.closeModal}>
            <CloseButton onClick={this.closeModal}>Close</CloseButton>
            {children}
          </ModalContent>
        </ModalContainer>
      </CSSTransition>
    );

    return (
      <TransitionGroup>
        {element}
      </TransitionGroup>
    );
  }
}

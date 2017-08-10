import * as React from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';
import { injectTracks, trackPage } from 'utils/analytics';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import messages from './messages';


const ModalContent = styled(clickOutside)`
  width: 100%;
  max-width: 1000px;
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
  url?: string;
  close: () => void;
  openModal: () => void,
  trackOpenModal: ({}) => void,
  trackCloseModal: ({}) => void,
};

type State = {};

class Modal extends React.PureComponent<Props, State> {


  componentWillReceiveProps(nextProps) {

    // If modal opens
    if (!this.props.opened && nextProps.opened){
      window.addEventListener('popstate', this.handlePopstateEvent);
      window.history.pushState({ path: nextProps.url }, '', nextProps.url);
      if (!document.body.classList.contains('modal-active')) {
        document.body.classList.add('modal-active');
      }
      // Since we bypass the normal history mechanism and take it into our own hands here,
      // we exceptionally also need to track the page change manually
      // Don't try this at home!
      nextProps.url && trackPage(nextProps.url);
      this.props.trackOpenModal({extra: {url: nextProps.url}});
    }

    // if modal closes
    if (this.props.opened && !nextProps.opened){
      window.removeEventListener('popstate', this.handlePopstateEvent);
      document.body.classList.remove('modal-active');
      this.props.trackCloseModal({extra: {url: this.props.url}});
    }
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopstateEvent);
    document.body.classList.remove('modal-active');
  }

  handlePopstateEvent = () => {
    this.props.close();
  }

  closeModal = () => {
    window.history.back();
  }

  render() {
    const { children, opened, url } = this.props;

    const element = opened && (
      <CSSTransition classNames="modal" timeout={400}>
        <ModalContainer>
          <ModalContent onClickOutside={this.closeModal}>
            <CloseButton onClick={this.closeModal}>
              <FormattedMessage {...messages.closeButtonLabel} />
            </CloseButton>
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

export default injectTracks({
  trackOpenModal: {name: 'Modal opened'},
  trackCloseModal: {name: 'Modal closed'},
})(Modal);

import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { CSSTransitionGroup } from 'react-transition-group';
import ClickOutside from 'utils/containers/clickOutside';

const enterClassName = 'modal-enter';
const enterActiveClassName = 'modal-enter-active';
const leaveClassName = 'modal-leave';
const leaveActiveClassName = 'modal-leave-active';

const ModalContent = styled(ClickOutside)`
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
  transition: all 400ms cubic-bezier(0.165, 0.84, 0.44, 1);
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
  transition: all 400ms cubic-bezier(0.165, 0.84, 0.44, 1);

  &.${enterClassName} {
    opacity: 0;
    will-change: opacity;

    ${ModalContent} {
      opacity: 0;
      transform: translateY(-100px);
      will-change: opacity, transform;
    }
  } 

  &.${enterActiveClassName} {
    opacity: 1;
    will-change: auto;

    ${ModalContent} {
      opacity: 1;
      transform: translateY(0px);
      will-change: auto;
    }
  }

  &.${leaveClassName} {
    opacity: 1;
    will-change: opacity;

    ${ModalContent} {
      opacity: 1;
      transform: translateY(0px);
      will-change: opacity, transform;
    }
  }

  &.${leaveActiveClassName} {
    opacity: 0;
    will-change: auto;

    ${ModalContent} {
      opacity: 0;
      transform: translateY(-100px);
      will-change: auto;
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

class Modal extends React.Component {

  handlePopstateEvent = () => {
    if (location.href === this.props.parentUrl) {
      this.closeModal();
    }
  }

  closeModal = () => {
    document.body.classList.remove('modal-active');

    window.removeEventListener('popstate', this.handlePopstateEvent);

    if (this.props.parentUrl && this.props.url) {
      window.history.pushState({ path: this.props.parentUrl }, '', this.props.parentUrl);
    }

    this.props.close();
  };

  render() {
    if (this.props.opened) {
      window.addEventListener('popstate', this.handlePopstateEvent);

      if (!document.body.classList.contains('modal-active')) {
        document.body.classList.add('modal-active');
      }

      if (this.props.parentUrl && this.props.url) {
        window.history.pushState({ path: this.props.url }, '', this.props.url);
      }

      return (
        <CSSTransitionGroup
          transitionName="modal"
          transitionEnterTimeout={400}
          transitionLeaveTimeout={400}
        >
          <ModalContainer>
            <ModalContent onClickOutside={this.closeModal}>
              <CloseButton onClick={this.closeModal}>Close</CloseButton>
              {this.props.children}
            </ModalContent>
          </ModalContainer>
        </CSSTransitionGroup>
      );
    }

    return (
      <CSSTransitionGroup
        transitionName="modal"
        transitionEnterTimeout={400}
        transitionLeaveTimeout={400}
      />
    );
  }
}

Modal.propTypes = {
  children: PropTypes.any.isRequired,
  opened: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  parentUrl: PropTypes.string,
  url: PropTypes.string,
};

export default Modal;

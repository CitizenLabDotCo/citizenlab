import React, { PureComponent } from 'react';

import {
  Icon,
  ClickOutside,
  media,
  colors,
} from '@citizenlab/cl2-component-library';
import { hideVisually } from 'polished';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import CSSTransition from 'react-transition-group/CSSTransition';
import { Subscription } from 'rxjs';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

import messages from './messages';

const enterTimeout = 350;
const enterDelay = 0;
const exitTimeout = 350;
const exitDelay = 0;
const easing = 'cubic-bezier(0.165, 0.84, 0.44, 1)';

const ModalWrapper = styled(ClickOutside)``;

const ModalContainer = styled.div<{ width: string }>`
  width: ${({ width }) => width};
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
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
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
  z-index: 1001;

  &:hover,
  &:focus {
    ${CloseIcon} {
      fill: #000;
    }
  }

  ${media.phone`
    height: 18px;
    width: 18px;
  `}
`;

const Overlay = styled.div`
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
      transform: translateX(400px);
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

const HiddenSpan = styled.span`
  ${hideVisually()}
`;

type Props = {
  opened: boolean;
  close: () => void;
  className?: string;
  label?: string;
  children?: any;
  width?: string;
};

type State = {
  innerModalOpened: boolean;
};

export default class SideModal extends PureComponent<Props, State> {
  private el: HTMLDivElement;
  private ModalPortal = document.getElementById('modal-portal');
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      innerModalOpened: false,
    };
    this.el = document.createElement('div');
    this.subscriptions = [];
  }

  componentDidMount() {
    if (!this.ModalPortal) {
      // eslint-disable-next-line no-console
      console.log(
        'There was no Portal to insert the modal. Please make sure you have a Portal root'
      );
    } else {
      this.ModalPortal.appendChild(this.el);
    }

    this.subscriptions = [
      eventEmitter.observeEvent('modalOpened').subscribe(() => {
        this.setState({ innerModalOpened: true });
      }),
      eventEmitter.observeEvent('modalClosed').subscribe(() => {
        this.setState({ innerModalOpened: false });
      }),
    ];
  }

  componentWillUnmount() {
    if (!this.ModalPortal) {
      // eslint-disable-next-line no-console
      console.log(
        'There was no Portal to insert the modal. Please make sure you have a Portal root'
      );
    } else {
      this.ModalPortal.removeChild(this.el);
    }

    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  clickOutsideModal = () => {
    this.props.close();
  };

  clickCloseButton = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.close();
  };

  render(): React.ReactNode {
    const { children, opened, label, width = '940px' } = this.props;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const modalPortalElement = document?.getElementById('modal-portal');

    if (modalPortalElement) {
      return createPortal(
        <CSSTransition
          classNames="modal"
          in={opened}
          timeout={{
            enter: enterTimeout + enterDelay,
            exit: exitTimeout + exitDelay,
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
            <ModalWrapper
              onClickOutside={this.clickOutsideModal}
              closeOnClickOutsideEnabled={!this.state.innerModalOpened}
            >
              <FocusOn>
                <ModalContainer width={width}>
                  <ModalContent id="e2e-side-modal-content">
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
                </CloseButton>
              </FocusOn>
            </ModalWrapper>
          </Overlay>
        </CSSTransition>,
        modalPortalElement
      );
    }

    return null;
  }
}

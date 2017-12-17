import * as React from 'react';
import * as _ from 'lodash';
import { browserHistory } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import clickOutside from 'utils/containers/clickOutside';

// animations
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// analytics
import { injectTracks, trackPage } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const ModalContent = styled(clickOutside)`
  width: 100%;
  max-width: 850px;
  display: flex;
  flex-direction: column;
  padding: 25px;
  margin-top: 50px;
  margin-bottom: 80px;
  border-radius: 10px;
  background: #fff;
  margin-left: auto;
  margin-right: auto;
  z-index: 1000;
  outline: none;

  ${media.phone`
    border-radius: 0;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
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
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  cursor: pointer;
  top: 15px;
  right: 15px;
  z-index: 2000;

  &:hover {
    ${CloseIcon} {
      fill: #ccc;
    }
  }
`;

const ModalContainer = styled.div`
  max-height: 100%;
  padding-left: 30px;
  padding-right: 30px;
  z-index: 1001;
  position: fixed;
  top: 0;
  right: 0;
  bottom: -200px;
  left: 0;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.8);
  will-change: auto;

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

  componentWillUpdate(nextProps: Props, nextState: State) {
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

    if (_.isFunction(this.unlisten)) {
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
    const { children, opened } = this.props;

    const element = (opened ? (
      <CSSTransition classNames="modal" timeout={350} exit={false}>
        <ModalContainer id="e2e-modal-container">
          <ModalContent onClickOutside={this.clickOutsideModal}>
            {children}
          </ModalContent>
          <CloseButton onClick={this.clickCloseButton}>
            <CloseIcon name="close2" />
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

import React, { PureComponent } from 'react';
import { createPortal } from 'react-dom';
import { adopt } from 'react-adopt';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import clHistory from 'utils/cl-router/history';
import eventEmitter from 'utils/eventEmitter';
import { FocusOn } from 'react-focus-on';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import { Icon } from 'cl2-component-library';
import clickOutside from 'utils/containers/clickOutside';

// resources
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import {
  media,
  colors,
  fontSizes,
  defaultOutline,
  viewportWidths,
  isRtl,
} from 'utils/styleUtils';

const desktopOpacityTimeout = 500;
const mobileOpacityTimeout = 250;

const desktopTransformTimeout = 500;
const mobileTransformTimeout = 700;

const desktopTranslateY = '-200px';
const mobileTranslateY = '300px';

const desktopEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const mobileEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';

export const ModalContentContainer = styled.div<{
  padding?: string | undefined;
}>`
  flex: 1 1 auto;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: ${({ padding }) => padding || '30px'};

  ${media.smallerThanMinTablet`
    padding: ${({ padding }) => padding || '20px'};
  `}
`;

const CloseButton = styled.button`
  width: 30px;
  height: 30px;
  position: absolute;
  top: 19px;
  right: 25px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  border-radius: 50%;
  border: solid 1px transparent;
  background: #fff;
  transition: all 100ms ease-out;
  outline: none !important;

  ${isRtl`
    right: auto;
    left: 25px;
  `}

  &:hover {
    background: #e0e0e0;
  }

  &.focus-visible {
    ${defaultOutline};
  }

  ${media.smallerThanMinTablet`
    top: 13px;
    right: 15px;
  `}
`;

const CloseIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  fill: ${(props: any) => props.theme.colorText};
`;

const StyledFocusOn = styled(FocusOn)<{ width: number }>`
  width: 100%;
  max-width: ${({ width }) => width}px;
  display: flex;
  justify-content: center;
`;

const ModalContainer = styled(clickOutside)<{ windowHeight: string }>`
  width: 100%;
  max-height: 85vh;
  margin-top: 50px;
  background: #fff;
  border-radius: ${({ theme }) => theme.borderRadius};
  display: flex;
  flex-direction: column;
  outline: none;
  overflow: hidden;
  padding: 0px;
  position: relative;

  &.fixedHeight {
    height: 100%;
    max-height: 600px;
  }

  /* tall desktops screens */
  @media (min-height: 1200px) {
    margin-top: 120px;
  }

  ${media.smallerThanMinTablet`
    max-width: calc(100vw - 30px);
    max-height: ${(props) => `calc(${props.windowHeight} - 30px)`};
    margin-top: 15px;

    &.fixedHeight {
      height: auto;
      max-height: 85vh;
    }
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
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  padding-left: 30px;
  padding-right: 30px;
  overflow: hidden;
  z-index: 1000001;
  will-change: opacity, transform;

  ${media.biggerThanMinTablet`
    justify-content: center;
  `}

  ${media.smallerThanMinTablet`
    padding-left: 12px;
    padding-right: 12px;
    padding: 0px;
  `}

  &.modal-enter {
    opacity: 0;

    ${ModalContainer} {
      opacity: 1;
      transform: translateY(${desktopTranslateY});

      ${media.smallerThanMinTablet`
        transform: translateY(${mobileTranslateY});
      `}
    }

    &.modal-enter-active {
      opacity: 1;
      transition: opacity ${desktopOpacityTimeout}ms ${desktopEasing};

      ${media.smallerThanMinTablet`
        transition: opacity ${mobileOpacityTimeout}ms ${mobileEasing};
      `}

      ${ModalContainer} {
        opacity: 1;
        transform: translateY(0px);
        transition: opacity ${desktopOpacityTimeout}ms ${desktopEasing},
          transform ${desktopTransformTimeout}ms ${desktopEasing};

        ${media.smallerThanMinTablet`
          transition: opacity ${mobileOpacityTimeout}ms ${mobileEasing},
                      transform ${mobileTransformTimeout}ms ${mobileEasing};
        `}
      }
    }
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: solid 1px #e0e0e0;
  background: transparent;

  ${media.smallerThanMinTablet`
    padding-top: 15px;
    padding-bottom: 15px;
    padding-left: 20px;
    padding-right: 20px;
  `}
`;

export const HeaderTitle = styled.h1`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  line-height: normal;
  margin: 0;
  margin-right: 45px;
  padding: 0;

  ${media.smallerThanMinTablet`
    margin-right: 35px;
  `}

  ${isRtl`
    text-align: right;
    margin: 0;
    margin-left: 45px;

    ${media.smallerThanMinTablet`
      margin-left: 35px;
    `}
  `}
`;

export const HeaderSubtitle = styled.h2`
  width: 100%;
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  margin: 0;
  margin-top: 5px;
  padding: 0;

  ${isRtl`
    text-align: right;
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

export const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;

  .Button {
    margin-right: 1rem;
    margin-bottom: 0.5rem;
  }
`;

export const Content = styled.p`
  font-size: ${fontSizes.base}px;
  line-height: ${fontSizes.xxl}px;
  margin-bottom: 30px;
`;

interface DataProps {
  windowSize: GetWindowSizeChildProps;
}

export interface InputProps {
  opened: boolean;
  fixedHeight?: boolean;
  width?: number;
  close: () => void;
  className?: string;
  header?: JSX.Element | string;
  footer?: JSX.Element;
  hasSkipButton?: boolean;
  skipText?: JSX.Element;
  padding?: string;
  noClose?: boolean;
  closeOnClickOutside?: boolean;
  children: React.ReactNode;
}

interface Props extends InputProps, DataProps {}

interface State {
  windowHeight: string;
}

class Modal extends PureComponent<Props, State> {
  unlisten: null | (() => void);
  subscription: Subscription | null;

  static defaultProps = {
    fixedHeight: false,
    width: 650,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      windowHeight: `${window.innerHeight}px`,
    };
    this.unlisten = null;
    this.subscription = null;
  }

  componentDidMount() {
    this.subscription = fromEvent(window, 'resize')
      .pipe(debounceTime(50), distinctUntilChanged())
      .subscribe((event) => {
        if (event.target) {
          const height = event.target['innerHeight'] as number;
          this.setState({ windowHeight: `${height}px` });
        }
      });
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.opened && this.props.opened) {
      this.openModal();
    } else if (prevProps.opened && !this.props.opened) {
      this.cleanup();
    }
  }

  componentWillUnmount() {
    this.subscription?.unsubscribe();
    this.cleanup();
  }

  openModal = () => {
    window.addEventListener('popstate', this.handlePopstateEvent);
    window.addEventListener('keydown', this.handleKeypress);
    eventEmitter.emit('modalOpened');
    this.unlisten = clHistory.listen(() => this.closeModal());
  };

  closeModal = () => {
    if (!this.props.noClose) {
      this.props.close();
    }
  };

  handlePopstateEvent = () => {
    this.closeModal();
  };

  handleKeypress = (event) => {
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
    }
  };

  cleanup = () => {
    window.removeEventListener('popstate', this.handlePopstateEvent);
    window.removeEventListener('keydown', this.handleKeypress);
    eventEmitter.emit('modalClosed');
    this.unlisten && this.unlisten();
    this.unlisten = null;
  };

  clickOutsideModal = () => {
    if (this.props.closeOnClickOutside !== false) {
      trackEventByName(tracks.clickOutsideModal);
      this.closeModal();
    }
  };

  clickCloseButton = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    trackEventByName(tracks.clickCloseButton);
    this.closeModal();
  };

  removeFocus = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  render() {
    const { windowHeight } = this.state;
    const {
      windowSize,
      width,
      children,
      opened,
      header,
      footer,
      hasSkipButton,
      skipText,
      noClose,
    } = this.props;
    const hasFixedHeight = this.props.fixedHeight;
    const smallerThanSmallTablet = windowSize
      ? windowSize <= viewportWidths.smallTablet
      : false;
    const modalPortalElement = document?.getElementById('modal-portal');
    let padding: string | undefined = undefined;

    if (header !== undefined || footer !== undefined) {
      padding = '0px';
    } else if (this.props.padding) {
      padding = this.props.padding;
    }

    if (modalPortalElement && width) {
      return createPortal(
        <CSSTransition
          classNames="modal"
          in={opened}
          timeout={
            smallerThanSmallTablet
              ? mobileTransformTimeout
              : desktopTransformTimeout
          }
          mountOnEnter={true}
          unmountOnExit={true}
          enter={true}
          exit={false}
        >
          <Overlay id="e2e-modal-container" className={this.props.className}>
            <StyledFocusOn width={width}>
              <ModalContainer
                className={`modalcontent ${
                  hasFixedHeight ? 'fixedHeight' : ''
                }`}
                onClickOutside={this.clickOutsideModal}
                windowHeight={windowHeight}
                ariaLabelledBy="modal-header"
                aria-modal="true"
                role="dialog"
              >
                {!noClose && (
                  <CloseButton
                    className="e2e-modal-close-button"
                    onMouseDown={this.removeFocus}
                    onClick={this.clickCloseButton}
                  >
                    <CloseIcon
                      title={<FormattedMessage {...messages.closeModal} />}
                      name="close"
                    />
                  </CloseButton>
                )}

                {header && (
                  <HeaderContainer>
                    <HeaderTitle id="modal-header">{header}</HeaderTitle>
                  </HeaderContainer>
                )}

                <ModalContentContainer padding={padding}>
                  {children}
                </ModalContentContainer>

                {footer && <FooterContainer>{footer}</FooterContainer>}

                {hasSkipButton && skipText && (
                  <Skip onClick={this.clickCloseButton}>{skipText}</Skip>
                )}
              </ModalContainer>
            </StyledFocusOn>
          </Overlay>
        </CSSTransition>,
        modalPortalElement
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <Modal {...inputProps} {...dataProps} />}
  </Data>
);

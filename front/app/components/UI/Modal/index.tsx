import React, { PureComponent, ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { adopt } from 'react-adopt';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import eventEmitter from 'utils/eventEmitter';
import { FocusOn } from 'react-focus-on';

// i18n
import messages from './messages';

// components
import { Box } from '@citizenlab/cl2-component-library';
import CloseIconButton from 'components/UI/CloseIconButton';
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
  fullScreen?: boolean;
}>`
  flex: 1 1 auto;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: ${({ padding }) => padding || '30px'};

  ${(props) => media.phone`
    padding: ${props.padding || '20px'};
  `}

  ${({ fullScreen }) =>
    fullScreen &&
    `
      display: flex;
      justify-content: center;
      padding-bottom: 40px !important;
  `}
`;

const StyledCloseIconButton = styled(CloseIconButton)<{
  fullScreen?: boolean;
}>`
  position: absolute;
  top: 12px;
  z-index: 2000;
  border-radius: 50%;
  border: solid 1px transparent;
  transition: all 100ms ease-out;
  outline: none !important;
  padding: 10px;

  &:hover {
    background: #e0e0e0;
  }

  &.focus-visible {
    ${defaultOutline};
  }
  ${isRtl`
    right: auto;
    left: 25px;
  `}

  ${({ fullScreen }) => (fullScreen ? 'left: 25px;' : 'right: 25px;')};

  ${(props) => media.phone`
    top: 13px;
    ${props.fullScreen ? 'left: auto;' : ''};
    right: 15px;
  `}
`;

const StyledCloseIconButton2 = styled(CloseIconButton)`
  position: absolute;
  top: 17px;
  z-index: 2000;
  border-radius: 50%;
  border: solid 1px transparent;
  transition: all 100ms ease-out;
  outline: none !important;
  padding: 10px;
  right: 22px;

  ${media.phone`
    right: 6px;
  `}

  &:hover {
    background: #e0e0e0;
  }

  &.focus-visible {
    ${defaultOutline};
  }
  ${isRtl`
    right: auto;
    left: 25px;
  `}
`;

// copy of the styled FocusOn container below
const StyledNonFocusableContainer = styled.div<{
  fullScreen?: boolean;
}>`
  width: 100%;
  display: flex;
  justify-content: center;

  ${({ fullScreen }) =>
    fullScreen &&
    `
      height: calc(100vh - 78px);
      max-width: 100%;
  `}
`;

const StyledFocusOn = styled(FocusOn)<{
  width: number | string;
  fullScreen?: boolean;
}>`
  width: 100%;
  max-width: ${({ width }) =>
    width.constructor === String ? width : `${width}px`};
  display: flex;
  justify-content: center;

  ${({ fullScreen }) =>
    fullScreen &&
    `
      height: calc(100vh - 78px);
      max-width: 100%;
  `}
`;

const ModalContainer = styled(clickOutside)<{
  windowHeight: number;
  fullScreen?: boolean;
}>`
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

  ${({ fullScreen }) =>
    fullScreen &&
    `
      margin: 0;
      align-items: center;
      max-height: 100%;
      border-radius: 0;
  `}

  /* tall desktops screens */
  @media (min-height: 1200px) {
    margin-top: 120px;
    ${({ fullScreen }) => fullScreen && 'margin-top: 0;'}
  }

  ${(props) => media.phone`
    max-width: calc(100vw - 30px);
    max-height: calc(${props.windowHeight}px - 30px);
    margin-top: 15px;

    &.fixedHeight {
      height: auto;
      max-height: 85vh;
    }

    ${
      props.fullScreen &&
      `
        margin-top: 0;
        max-height: 100%;
        max-width: 100%;
      `
    }
  `}
`;

const Overlay = styled.div<{
  fullScreen?: boolean;
  zIndex?: number;
}>`
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
  will-change: opacity, transform;

  z-index: ${({ fullScreen, zIndex }) => {
    if (zIndex !== undefined) {
      return zIndex.toString();
    }

    return fullScreen ? '400' : '1000001';
  }};

  ${({ fullScreen }) =>
    fullScreen &&
    `
      margin-top: 78px;
      padding: 0px;
  `}

  ${media.desktop`
    justify-content: center;
  `}

  ${media.phone`
    padding-left: 12px;
    padding-right: 12px;
    padding: 0px;
  `}

  &.modal-enter {
    opacity: 0;

    ${ModalContainer} {
      opacity: 1;
      transform: translateY(${desktopTranslateY});

      ${media.phone`
        transform: translateY(${mobileTranslateY});
      `}
    }

    &.modal-enter-active {
      opacity: 1;
      transition: opacity ${desktopOpacityTimeout}ms ${desktopEasing};

      ${media.phone`
        transition: opacity ${mobileOpacityTimeout}ms ${mobileEasing};
      `}

      ${ModalContainer} {
        opacity: 1;
        transform: translateY(0px);
        transition: opacity ${desktopOpacityTimeout}ms ${desktopEasing},
          transform ${desktopTransformTimeout}ms ${desktopEasing};

        ${media.phone`
          transition: opacity ${mobileOpacityTimeout}ms ${mobileEasing},
                      transform ${mobileTransformTimeout}ms ${mobileEasing};
        `}

        ${({ fullScreen }) =>
          fullScreen &&
          `
            transition: opacity 0ms ${mobileEasing},
            transform 0ms ${mobileEasing};
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

  ${media.phone`
    padding-top: 15px;
    padding-bottom: 15px;
    padding-left: 20px;
    padding-right: 20px;
  `}
`;

export const HeaderTitle = styled.h1`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  line-height: normal;
  margin: 0;
  margin-right: 45px;
  padding: 0;

  ${media.phone`
    margin-right: 35px;
  `}

  ${isRtl`
    text-align: right;
    margin: 0;
    margin-left: 45px;

    ${media.phone`
      margin-left: 35px;
    `}
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
  border-top: solid 1px ${colors.divider};
  background: #fff;

  ${media.phone`
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

  ${media.tablet`
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

const ModalContentContainerSwitch = ({
  fullScreen,
  width,
  children,
}: {
  fullScreen: boolean | undefined;
  width: number | string;
  children: ReactElement | ReactElement[];
}) => {
  if (fullScreen) {
    return (
      <StyledNonFocusableContainer fullScreen={fullScreen}>
        {children}
      </StyledNonFocusableContainer>
    );
  }

  return (
    <StyledFocusOn width={width} fullScreen={fullScreen}>
      {children}
    </StyledFocusOn>
  );
};

interface DataProps {
  windowSize: GetWindowSizeChildProps;
}

export interface InputProps {
  opened: boolean;
  fixedHeight?: boolean;
  width?: number | string;
  close: () => void;
  className?: string;
  header?: JSX.Element | string;
  niceHeader?: boolean;
  footer?: JSX.Element;
  hasSkipButton?: boolean;
  skipText?: JSX.Element;
  padding?: string;
  closeOnClickOutside?: boolean;
  children: React.ReactNode;
  fullScreen?: boolean;
  zIndex?: number;
  hideCloseButton?: boolean;
}

interface Props extends InputProps, DataProps {}

interface State {
  windowHeight: number;
}

class Modal extends PureComponent<Props, State> {
  subscription: Subscription | null;

  static defaultProps = {
    fixedHeight: false,
    width: 650,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      windowHeight: window.innerHeight,
    };
    this.subscription = null;
  }

  componentDidMount() {
    this.subscription = fromEvent(window, 'resize')
      .pipe(debounceTime(50), distinctUntilChanged())
      .subscribe((event) => {
        if (event.target) {
          const height = event.target['innerHeight'] as number;
          this.setState({ windowHeight: height });
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
  };

  closeModal = () => {
    this.props.close();
  };

  handlePopstateEvent = () => {
    this.closeModal();
  };

  handleKeypress = (event: KeyboardEvent) => {
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
    }
  };

  cleanup = () => {
    window.removeEventListener('popstate', this.handlePopstateEvent);
    window.removeEventListener('keydown', this.handleKeypress);
    eventEmitter.emit('modalClosed');
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

  render() {
    const { windowHeight } = this.state;
    const {
      windowSize,
      width,
      children,
      opened,
      header,
      niceHeader,
      footer,
      hasSkipButton,
      skipText,
      fullScreen,
      zIndex,
      hideCloseButton,
    } = this.props;
    const hasFixedHeight = this.props.fixedHeight;
    const smallerThanSmallTablet = windowSize
      ? windowSize <= viewportWidths.tablet
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
          <Overlay
            id="e2e-modal-container"
            className={this.props.className}
            fullScreen={fullScreen}
            zIndex={zIndex}
          >
            <ModalContentContainerSwitch width={width} fullScreen={fullScreen}>
              <ModalContainer
                fullScreen={fullScreen}
                className={`modalcontent ${
                  hasFixedHeight ? 'fixedHeight' : ''
                }`}
                onClickOutside={this.clickOutsideModal}
                windowHeight={windowHeight}
                ariaLabelledBy={header ? 'modal-header' : undefined}
                aria-modal="true"
                role="dialog"
              >
                {!niceHeader && (
                  <>
                    {!hideCloseButton && (
                      <StyledCloseIconButton
                        fullScreen={fullScreen}
                        className="e2e-modal-close-button"
                        onClick={this.clickCloseButton}
                        iconColor={colors.textSecondary}
                        iconColorOnHover={'#000'}
                        a11y_buttonActionMessage={messages.closeModal}
                      />
                    )}

                    {header && (
                      <HeaderContainer>
                        <HeaderTitle id="modal-header">{header}</HeaderTitle>
                      </HeaderContainer>
                    )}
                  </>
                )}

                {/* TODO: actually fix the header by always using the 'nice' header.
                 * Didn't dare to do that yet because the modal with header is used
                 * in so many different places, and I was scared of breaking something.
                 * Made a task for this already: CL-2962
                 * (Luuc)
                 */}
                {header && niceHeader && (
                  <>
                    <Box
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      w="100%"
                      py="8px"
                      borderBottom={`solid 1px ${colors.divider}`}
                    >
                      <Box
                        w="100%"
                        h="100%"
                        display="flex"
                        alignItems="center"
                        minHeight="66px"
                      >
                        {header}
                      </Box>
                    </Box>
                    {!hideCloseButton && (
                      <Box mr={smallerThanSmallTablet ? '0px' : '8px'}>
                        <StyledCloseIconButton2
                          className="e2e-modal-close-button"
                          iconColor={colors.textSecondary}
                          iconColorOnHover={colors.black}
                          a11y_buttonActionMessage={messages.closeModal}
                          onClick={this.clickCloseButton}
                        />
                      </Box>
                    )}
                  </>
                )}

                <ModalContentContainer
                  padding={padding}
                  fullScreen={fullScreen}
                >
                  {children}
                </ModalContentContainer>

                {footer && <FooterContainer>{footer}</FooterContainer>}

                {hasSkipButton && skipText && (
                  <Skip onClick={this.clickCloseButton}>{skipText}</Skip>
                )}
              </ModalContainer>
            </ModalContentContainerSwitch>
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

import React, { PureComponent } from 'react';

import { Color, colors, media } from '@citizenlab/cl2-component-library';
import { compact } from 'lodash-es';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import CSSTransition from 'react-transition-group/CSSTransition';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';

import useLocale from 'hooks/useLocale';

// resource

const slideInOutTimeout = 500;
const slideInOutEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';

const Container = styled.div<{
  windowHeight: number;
  contentBgColor?: InputProps['contentBgColor'];
}>`
  width: 100vw;
  height: ${({ windowHeight, theme }) =>
    `calc(${windowHeight}px - ${theme.menuHeight}px)`};
  position: fixed;
  top: ${({ theme }) => theme.menuHeight}px;
  left: 0;
  display: flex;
  overflow: hidden;
  background: ${({ contentBgColor }) =>
    contentBgColor ? colors[contentBgColor] : colors.white};
  z-index: 1003;

  &.modal-enter {
    transform: translateY(100vh);

    &.modal-enter-active {
      transform: translateY(0px);
      transition: all ${slideInOutTimeout}ms ${slideInOutEasing};
    }
  }

  &.modal-exit {
    transform: translateY(0px);

    &.modal-exit-active {
      transform: translateY(100vh);
      transition: all ${slideInOutTimeout}ms ${slideInOutEasing};
    }
  }

  ${(props) => media.tablet`
    height: 100vh;
    top: 0;
    bottom: ${props.theme.mobileMenuHeight}px;
    z-index: 1005; /* there is no top navbar at this screen size, so okay that it is higher than the z-index of NavBar here */

    &.hasBottomBar {
      height: ${props.windowHeight}px;
      bottom: 0;
    }
  `}
`;

const StyledFocusOn = styled(FocusOn)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  transform: translate3d(0, 0, 0);
`;

interface InputProps {
  className?: string;
  opened: boolean;
  close: () => void;
  topBar?: JSX.Element | null;
  bottomBar?: JSX.Element | null;
  animateInOut?: boolean;
  mobileNavbarRef?: HTMLElement | null;
  children: JSX.Element | null | undefined;
  modalPortalElement?: HTMLElement;
  contentBgColor?: Color;
}

interface Props extends InputProps {
  locale: SupportedLocale;
}

interface State {
  windowHeight: number;
}

class FullscreenModal extends PureComponent<Props, State> {
  subscription: Subscription | null = null;
  unlisten: { (): void } | null = null;
  url: string | null | undefined = null;
  goBackUrl: string | null | undefined = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      windowHeight: window.innerHeight,
    };
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

  componentWillUnmount() {
    this.subscription?.unsubscribe();
  }

  render() {
    const { windowHeight } = this.state;
    const {
      children,
      opened,
      topBar,
      bottomBar,
      animateInOut,
      mobileNavbarRef,
      className,
      contentBgColor,
    } = this.props;
    const shards = compact([mobileNavbarRef]);
    const modalPortalElement =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      this.props.modalPortalElement || document?.getElementById('modal-portal');
    let modalContent: React.ReactChild | null = null;

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (animateInOut || (!animateInOut && opened)) {
      modalContent = (
        <Container
          id="e2e-fullscreenmodal-content"
          className={[bottomBar ? 'hasBottomBar' : '', className].join()}
          windowHeight={windowHeight}
          contentBgColor={contentBgColor}
        >
          <StyledFocusOn autoFocus={false} shards={shards}>
            {topBar}
            <Content className="fullscreenmodal-scrollcontainer">
              {children}
            </Content>
            {bottomBar}
          </StyledFocusOn>
        </Container>
      );
    }

    if (animateInOut) {
      return createPortal(
        <CSSTransition
          classNames="modal"
          in={opened}
          timeout={{
            enter: slideInOutTimeout,
            exit: slideInOutTimeout,
          }}
          mountOnEnter={true}
          unmountOnExit={true}
          enter={true}
          exit={true}
        >
          {modalContent}
        </CSSTransition>,
        document.getElementById('modal-portal') as HTMLElement
      );
    }

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!animateInOut && opened && modalPortalElement) {
      return createPortal(modalContent, modalPortalElement);
    }

    return null;
  }
}

export default (inputProps: InputProps) => {
  const locale = useLocale();

  return <FullscreenModal {...inputProps} locale={locale} />;
};

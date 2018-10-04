// libraries
import React, { PureComponent } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  position: relative;
  outline: none;

  * {
    outline: none;
    user-select: none;
  }
`;

const Content: any = styled(clickOutside)`
  position: absolute;
  top: ${(props: any) => props.top || '0px'};
  left: 50%;
  transform-origin: top left;
  z-index: 2;

  &.dropdown-enter {
    opacity: 0;
    transform: scale(0.92);

    &.dropdown-enter-active {
      opacity: 1;
      transform: scale(1);
      transition: all 250ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

const ContentInner: any = styled.div`
  position: relative;
  left: -50%;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  background-color: ${(props: any) => props.backgroundColor};
  border: solid 1px ${(props: any) => props.borderColor || colors.separation};

  ::before,
  ::after {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  ::after {
    top: -20px;
    left: 0;
    right: 0;
    margin: 0 auto;
    border-color: transparent transparent ${(props: any) => props.backgroundColor} transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: 0;
    right: 0;
    margin: 0 auto;
    border-color: transparent transparent ${(props: any) => props.borderColor || colors.separation} transparent;
    border-width: 11px;
  }
`;

interface Props {
  children: JSX.Element;
  content: JSX.Element;
  top: string;
  backgroundColor: string;
  borderColor?: string;
  onClickOutside: (Event) => void;
  dropdownOpened: boolean;
  className?: string;
}

export default class Popover extends PureComponent<Props> {
  render() {
    const { onClickOutside, dropdownOpened, children, content, backgroundColor, borderColor, top } = this.props;

    return (
      <Container className={this.props['className']}>
        {children}

        <CSSTransition
          in={dropdownOpened}
          timeout={200}
          mountOnEnter={true}
          unmountOnExit={true}
          classNames="dropdown"
          exit={false}
        >
          <Content onClickOutside={onClickOutside} top={top}>
            <ContentInner backgroundColor={backgroundColor} borderColor={borderColor}>
              {content}
            </ContentInner>
          </Content>
        </CSSTransition>
      </Container>
    );
  }
}

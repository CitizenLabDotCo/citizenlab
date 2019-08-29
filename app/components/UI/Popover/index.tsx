// libraries
import React, { PureComponent } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
`;

const Content: any = styled(clickOutside)`
  position: absolute;
  top: ${(props: any) => parseInt(props.top, 10) || 0}px;
  left: 50%;
  transform-origin: top left;
  z-index: 3;

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

const ContentInner: any = styled.div<{ position?: 'bottom-left'}>`
  position: relative;
  left: ${({ position }) => position === 'bottom-left' ? '-85%' : '-50%'};
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
  border-radius: ${(props: any) => props.theme.borderRadius};
  background-color: ${(props: any) => props.backgroundColor};
  color: ${(props: any) => props.textColor};
  fill: ${(props: any) => props.textColor};
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
    left:  ${({ position }) => position === 'bottom-left' ? '75%' : '0'};
    right: 0;
    margin: 0 auto;
    border-color: transparent transparent ${(props: any) => props.backgroundColor} transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: ${({ position }) => position === 'bottom-left' ? '75%' : '0'};
    right: 0;
    margin: 0 auto;
    border-color: transparent transparent ${(props: any) => props.borderColor || colors.separation} transparent;
    border-width: 11px;
  }
`;

export interface Props {
  content: JSX.Element;
  top: string;
  backgroundColor: string;
  borderColor?: string;
  textColor?: string;
  onClickOutside: (event) => void;
  dropdownOpened: boolean;
  className?: string;
  id?: string;
  position?: 'bottom-left';
}

export default class Popover extends PureComponent<Props> {
  render() {
    const { onClickOutside, dropdownOpened, children, content, textColor, backgroundColor, borderColor, top, className, id, position } = this.props;

    return (
      <Container className={className}>
        {children}

        <CSSTransition
          in={dropdownOpened}
          timeout={200}
          mountOnEnter={true}
          unmountOnExit={true}
          classNames="dropdown"
          exit={false}
        >
          <Content onClickOutside={onClickOutside} top={top} className="tooltip-container">
            <ContentInner id={id} backgroundColor={backgroundColor} textColor={textColor} borderColor={borderColor} className="tooltip-content" position={position}>
              {content}
            </ContentInner>
          </Content>
        </CSSTransition>
      </Container>
    );
  }
}

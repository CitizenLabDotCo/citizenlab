import React, { PureComponent } from 'react';
import styled from 'styled-components';

import Label from 'components/UI/Label';
import Icon from 'components/UI/Icon';

import { colors } from 'utils/styleUtils';
import CSSTransition from 'react-transition-group/CSSTransition';

const timeout = 400;

const StyledLabel = styled(Label)`
  padding-bottom: 0px;
  transition: all 80ms ease-out;
  cursor: pointer;
`;

const ArrowIcon = styled(Icon) `
  fill: ${(props) => props.theme.colors.label};
  height: 11px;
  margin-right: 8px;
  transition: transform 350ms cubic-bezier(0.165, 0.84, 0.44, 1),
              fill 80ms ease-out;

  &.opened {
    transform: rotate(90deg);
  }
`;

const Options: any = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  transition: all 80ms ease-out;
  cursor: pointer;

  &:hover {
    ${StyledLabel} {
      color: ${colors.adminTextColor};
    }

    ${ArrowIcon} {
      fill: ${colors.adminTextColor};
    }
  }
`;

const CollapseContainer = styled.div`
  width: 497px;
  position: relative;
  border-radius: 5px;
  border: solid 1px #ddd;
  background: #fff;
  z-index: 1;
  opacity: 0;
  display: none;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: opacity, height;

  &.collapse-enter {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;
    display: block;

    &.collapse-enter-active {
      opacity: 1;
      max-height: 500px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-enter-done {
    opacity: 1;
    overflow: visible;
    display: block;
  }

  &.collapse-exit {
    opacity: 1;
    max-height: 500px;
    overflow: hidden;
    display: block;

    &.collapse-exit-active {
      opacity: 0;
      max-height: 0px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-exit-done {
    display: none;
  }
`;

interface Props {
  label: JSX.Element | string;
  children: JSX.Element | string;
  opened: boolean;
  onToggle: () => void;
}

const CollapseInner = styled.div`
  padding: 20px;
  padding-bottom: 0px;
`;

class Collapse extends PureComponent<Props> {

  handleToggle = () => {
    this.props.onToggle();
  }

  render() {
    const { label, children, opened } = this.props;

    return (
      <>
        <Options onClick={this.handleToggle}>
          <ArrowIcon name="chevron-right" className={`${opened && 'opened'}`} />
          <StyledLabel>
            {label}
          </StyledLabel>
        </Options>

        <CSSTransition
          classNames="collapse"
          in={opened}
          timeout={timeout}
          mounOnEnter={false}
          unmountOnExit={false}
          enter={true}
          exit={true}
        >
          <CollapseContainer>
            <CollapseInner>
              {children}
            </CollapseInner>
          </CollapseContainer>
        </CSSTransition>
      </>
    );
  }
}

export default Collapse;

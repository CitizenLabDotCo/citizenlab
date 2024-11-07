import React, { PureComponent } from 'react';

import {
  Icon,
  IconTooltip,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';

import { removeFocusAfterMouseClick } from 'utils/helperUtils';

const timeout = 400;

const Container = styled.div``;

const ArrowIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  flex: 0 0 24px;
  margin-right: 8px;
  transition: transform 350ms cubic-bezier(0.165, 0.84, 0.44, 1),
    fill 80ms ease-out;

  &.opened {
    transform: rotate(90deg);
  }
`;

const CollapseExpandButton = styled.button`
  text-align: left;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  margin-right: 8px;
  border: none;
  cursor: pointer;
  transition: all 80ms ease-out;

  &:hover {
    color: ${darken(0.25, colors.textSecondary)};

    ${ArrowIcon} {
      fill: ${darken(0.25, colors.textSecondary)};
    }
  }
`;

const Label = styled.label`
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  margin-bottom: 10px;
`;

const CollapseContainer = styled.div`
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
      max-height: 1000px;
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
    max-height: 1000px;
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
  labelTooltipText?: string | JSX.Element | null;
  opened: boolean;
  onToggle: (event: React.MouseEvent) => void;
  className?: string;
  children?: React.ReactNode;
}

class Collapse extends PureComponent<Props> {
  handleToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    this.props.onToggle(event);
  };

  render() {
    const { label, labelTooltipText, children, opened, className } = this.props;

    return (
      <Container className={className}>
        <Label>
          <CollapseExpandButton
            type="button"
            onMouseDown={removeFocusAfterMouseClick}
            onClick={this.handleToggle}
          >
            <ArrowIcon
              name="chevron-right"
              className={`${opened && 'opened'}`}
            />
            {label}
          </CollapseExpandButton>
          {labelTooltipText && <IconTooltip content={labelTooltipText} />}
        </Label>

        <CSSTransition
          classNames="collapse"
          in={opened}
          timeout={timeout}
          mounOnEnter={false}
          unmountOnExit={false}
          enter={true}
          exit={true}
        >
          <CollapseContainer>{children}</CollapseContainer>
        </CSSTransition>
      </Container>
    );
  }
}

/** @deprecated Use CollapsibleContainer from the component library instead.*/
export default Collapse;

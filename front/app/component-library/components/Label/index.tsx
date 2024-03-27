import React, { PureComponent, MouseEvent } from 'react';

import styled from 'styled-components';

import { fontSizes, colors, invisibleA11yText } from '../../utils/styleUtils';

const Container = styled.label`
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  margin: 0;
  padding: 0;
  margin-bottom: 10px;

  & > :not(last-child) {
    margin-right: 4px;
  }

  & .tooltip-icon {
    margin-left: 6px;
  }

  &.invisible {
    ${invisibleA11yText}
  }
`;

type Props = {
  id?: string;
  value?: string | JSX.Element;
  htmlFor?: string;
  children?: any;
  hidden?: boolean;
  className?: string;
  onClick?: (event: MouseEvent) => void;
};

export default class Label extends PureComponent<Props> {
  handleOnClick = (event: MouseEvent) => {
    this.props.onClick && this.props.onClick(event);
  };

  render() {
    const { value, htmlFor, children, id, className, hidden } = this.props;

    return (
      <Container
        id={id}
        className={`${className || ''} ${hidden ? 'invisible' : ''}`}
        htmlFor={htmlFor}
        onClick={this.handleOnClick}
      >
        {children || value}
      </Container>
    );
  }
}

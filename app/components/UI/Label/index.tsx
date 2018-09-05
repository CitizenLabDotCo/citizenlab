import React from 'react';
import styled from 'styled-components';
import { remCalc, fontSize, color, invisibleA11yText, booleanClass } from 'utils/styleUtils';

const StyledLabel = styled.label`
  color: ${color('label')};
  display: flex;
  font-size: ${fontSize('base')};
  font-weight: 400;
  margin: 0;
  padding-bottom: ${remCalc(10)};

  &.invisible {
    ${invisibleA11yText}
  }
`;

type Props = {
  value?: string | JSX.Element;
  htmlFor?: string;
  children?: any;
  hidden?: boolean;
};

type State = {};

export default class Label extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { value, htmlFor, children } = this.props;
    const className = this.props['className'];

    return (
      <StyledLabel className={`${booleanClass(className, className)}${booleanClass(this.props.hidden, 'invisible')}`} htmlFor={htmlFor}>{children || value}</StyledLabel>
    );
  }
}

import React from 'react';
import styled from 'styled-components';
import { remCalc, fontSizes, colors, invisibleA11yText, booleanClass } from 'utils/styleUtils';

const StyledLabel = styled.label`
  color: ${colors.label};
  display: flex;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin: 0;
  padding-bottom: ${remCalc(10)};

  & > :not(last-child) {
    margin-right: 7px;
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
};

type State = {};

export default class Label extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { value, htmlFor, children, id } = this.props;
    const className = this.props['className'];

    return (
      <StyledLabel id={id} className={`${booleanClass(className, className)}${booleanClass(this.props.hidden, 'invisible')}`} htmlFor={htmlFor}>{children || value}</StyledLabel>
    );
  }
}

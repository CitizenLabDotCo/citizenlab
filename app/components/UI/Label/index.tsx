import * as React from 'react';
import styled from 'styled-components';
import { remCalc, fontSize, color } from 'utils/styleUtils';

const StyledLabel = styled.label`
  color: ${color('label')};
  display: flex;
  font-size: ${fontSize('base')};
  font-weight: 400;
  margin: 0;
  padding-bottom: ${remCalc(10)};
`;

type Props = {
  value?: string | JSX.Element;
  htmlFor?: string;
  children?: any;
};

type State = {};

export default class Label extends React.PureComponent<Props, State> {
  render() {
    const { value, htmlFor, children } = this.props;
    const className = this.props['className'];

    return (
      <StyledLabel className={className} htmlFor={htmlFor}>{children || value}</StyledLabel>
    );
  }
}

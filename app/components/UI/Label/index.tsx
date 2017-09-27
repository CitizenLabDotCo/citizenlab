import * as React from 'react';
import styled from 'styled-components';

const StyledLabel = styled.label`
  color: #666;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  padding-bottom: 5px;
`;

type Props = {
  value?: string;
  htmlFor?: string;
  children?: any;
};

type State = {};

export default class Label extends React.PureComponent<Props, State> {
  render() {
    const { value, htmlFor, children } = this.props;

    return (
      <StyledLabel htmlFor={htmlFor}>{children || value}</StyledLabel>
    );
  }
}

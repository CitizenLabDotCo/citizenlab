import * as React from 'react';
import styled from 'styled-components';

const StyledLabel = styled.label`
  color: #666;
  font-size: 17px;
  font-weight: 400;
  display: flex;
  padding-bottom: 6px;
`;

const Label: React.SFC<ILabel> = ({ value, htmlFor }) => <StyledLabel htmlFor={htmlFor}>{value}</StyledLabel>;

interface ILabel {
  value: string;
  htmlFor?: string;
}

export default Label;

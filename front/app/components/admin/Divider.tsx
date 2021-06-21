import React from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const StyledHr = styled.hr`
  display: block;
  height: 1px;
  border: 0;
  border-top: 1px solid ${colors.separation};
  margin: 1em 0;
  padding: 0;
`;

const Divider = ({ className }: { className?: string }) => (
  <StyledHr className={className} />
);

export default Divider;

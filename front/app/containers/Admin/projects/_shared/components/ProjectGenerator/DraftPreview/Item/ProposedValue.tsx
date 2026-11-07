import { colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled, { css, keyframes } from 'styled-components';

import { motion } from '../../animations';

const highlight = keyframes`
  from {
    background-color: ${colors.teal100};
  }
  to {
    background-color: ${colors.teal50};
  }
`;

// What a proposed change adds or sets.
const ProposedValue = styled.span`
  background-color: ${colors.teal50};
  border-radius: ${stylingConsts.borderRadius};
  box-decoration-break: clone;
  padding: 0 4px;
  margin: 0 -4px;
  ${motion(css`
    animation: ${highlight} 1200ms ease-out both;
  `)}
`;

export default ProposedValue;

import React from 'react';

import { Box, Icon, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// A small "assistant is thinking" indicator — the stars mark plus three dots
// that pulse in sequence. Shown for a brief beat before the lead line and each
// follow-up question appear, so the intake reads as a chat with someone
// generating the next step rather than a form snapping open on Enter.

const Dot = styled.span<{ $delay: number }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${colors.teal500};
  display: inline-block;
  animation: thinkingPulse 1.1s ease-in-out ${({ $delay }) => $delay}ms infinite;

  @keyframes thinkingPulse {
    0%,
    80%,
    100% {
      opacity: 0.25;
      transform: translateY(0);
    }
    40% {
      opacity: 1;
      transform: translateY(-3px);
    }
  }
`;

const ThinkingDots = () => (
  <Box display="flex" alignItems="center" gap="8px">
    <Icon name="stars" width="16px" height="16px" fill={colors.teal500} />
    <Box display="flex" alignItems="center" gap="4px">
      <Dot $delay={0} />
      <Dot $delay={150} />
      <Dot $delay={300} />
    </Box>
  </Box>
);

export default ThinkingDots;

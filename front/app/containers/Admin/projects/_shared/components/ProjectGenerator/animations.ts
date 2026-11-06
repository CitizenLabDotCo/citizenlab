import { Box, colors } from '@citizenlab/cl2-component-library';
import styled, { css, keyframes } from 'styled-components';

const enter = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

const pulse = keyframes`
  50% {
    opacity: 0.35;
  }
`;

export const motion = (rules: ReturnType<typeof css>) => css`
  @media (prefers-reduced-motion: no-preference) {
    ${rules}
  }
`;

// The component library has no props for animations.
export const Appear = styled(Box)`
  ${motion(css`
    animation: ${enter} 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  `)}
`;

export const PulsingDot = styled.span`
  display: inline-block;
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${colors.teal400};
  ${motion(css`
    animation: ${pulse} 1600ms ease-in-out infinite;
  `)}
`;

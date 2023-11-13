import React from 'react';
import { Icon, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const StyledIcon = styled(Icon)<{ showAnimation: boolean }>`
  animation-name: blink-animation;
  animation-duration: ${({ showAnimation }) => (showAnimation ? '1.8s' : '0s')};
  animation-delay: 1s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;

  @keyframes blink-animation {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

interface Props {
  hasUserParticipated: boolean;
}

const ParticipationIcon = ({ hasUserParticipated }: Props) => {
  return (
    <StyledIcon
      name={hasUserParticipated ? 'check-circle' : 'dot'}
      width="16px"
      height="16px"
      fill={colors.white}
      showAnimation={!hasUserParticipated}
    />
  );
};

export default ParticipationIcon;

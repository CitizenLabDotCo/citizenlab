import React from 'react';

import { Icon, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const StyledIcon = styled(Icon)`
  animation-name: blink-animation;
  animation-duration: '1.8s';
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

const ParticipationOpenIcon = () => {
  return (
    <StyledIcon name={'dot'} width="16px" height="16px" fill={colors.white} />
  );
};

export default ParticipationOpenIcon;

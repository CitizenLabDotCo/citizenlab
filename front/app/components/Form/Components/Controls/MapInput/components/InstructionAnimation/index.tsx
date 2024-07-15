import React, { useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import styled, { useTheme } from 'styled-components';

type InstructionAnimationProps = {
  instructionRef: React.RefObject<HTMLDivElement>;
  inputType: 'point' | 'line' | 'polygon';
  data: any;
};

const StyledBox = styled(Box)<{ tenantColor: string }>`
  .MapBg > g > path {
    fill: ${({ tenantColor }) => tenantColor};
  }
`;

const InstructionAnimation = ({
  instructionRef,
  inputType,
  data,
}: InstructionAnimationProps) => {
  const theme = useTheme();
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  const getAnimation = () => {
    switch (inputType) {
      case 'point':
        return require('./animations/pin-drop.json');
      case 'line':
        return require('./animations/line-draw.json');
      case 'polygon':
        return require('./animations/polygon-draw.json');
    }
  };

  const showInstructions = () => {
    switch (inputType) {
      case 'point':
        return !data?.coordinates;
      case 'line':
        return !data || data?.coordinates?.length < 2;
      case 'polygon':
        return !data || data?.coordinates?.[0]?.length < 4;
    }
  };

  const onClick = () => {
    // For accessibility reasons, the animation must stop once it's clicked.
    lottieRef?.current?.stop();
  };

  return (
    <StyledBox
      ref={instructionRef}
      maxWidth="100px"
      onClick={onClick}
      tenantColor={theme.colors.tenantPrimary}
    >
      {showInstructions() && (
        <Lottie
          animationData={getAnimation()}
          loop={true}
          lottieRef={lottieRef}
        />
      )}
    </StyledBox>
  );
};

export default InstructionAnimation;

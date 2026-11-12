import React, { ReactNode } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useFitPhonePreview, {
  PHONE_LOGICAL_HEIGHT,
  PHONE_LOGICAL_WIDTH,
  PHONE_PREVIEW_PADDING,
} from './useFitPhonePreview';

interface Props {
  screen: ReactNode;
  className?: string;
  dataCy?: string;
  alignTop?: boolean;
  children?: ReactNode;
}

const PhonePreviewFrame = ({
  screen,
  className,
  dataCy,
  alignTop = false,
  children,
}: Props) => {
  const { scale, containerRef } = useFitPhonePreview();

  return (
    <Box
      ref={containerRef}
      h="100%"
      minHeight="100%"
      display="flex"
      alignItems={alignTop ? 'flex-start' : 'center'}
      justifyContent="center"
      overflow={alignTop ? 'visible' : 'hidden'}
      p={`${PHONE_PREVIEW_PADDING}px`}
      pt={alignTop ? '0px' : `${PHONE_PREVIEW_PADDING}px`}
    >
      <Box
        className={className}
        data-cy={dataCy}
        position="relative"
        w={`${PHONE_LOGICAL_WIDTH * scale}px`}
        h={`${PHONE_LOGICAL_HEIGHT * scale}px`}
        background={colors.white}
        border={`1.5px solid ${colors.grey300}`}
        borderRadius="22px"
        overflow="hidden"
        boxShadow="0 10px 30px rgba(20, 25, 40, 0.07)"
      >
        <Box
          w={`${PHONE_LOGICAL_WIDTH}px`}
          h={`${PHONE_LOGICAL_HEIGHT}px`}
          transform={`scale(${scale})`}
          style={{ transformOrigin: 'top left' }}
        >
          {screen}
        </Box>
        {children}
      </Box>
    </Box>
  );
};

export default PhonePreviewFrame;

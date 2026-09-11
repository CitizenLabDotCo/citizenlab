import React, { ReactNode } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useFitPhonePreview, {
  PHONE_LOGICAL_HEIGHT,
  PHONE_LOGICAL_WIDTH,
  PHONE_PREVIEW_PADDING,
} from './useFitPhonePreview';

interface Props {
  src: string;
  title: string;
  className?: string;
  dataCy?: string;
  children?: ReactNode;
}

const PhonePreview = ({ src, title, className, dataCy, children }: Props) => {
  const { scale, containerRef } = useFitPhonePreview();

  return (
    <Box
      ref={containerRef}
      h="100%"
      minHeight="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      p={`${PHONE_PREVIEW_PADDING}px`}
      background={`radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.04) 1px, transparent 0) 0 0 / 18px 18px, ${colors.background}`}
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
          as="iframe"
          src={src}
          title={title}
          display="block"
          w={`${PHONE_LOGICAL_WIDTH}px`}
          h={`${PHONE_LOGICAL_HEIGHT}px`}
          border="none"
          transform={`scale(${scale})`}
          style={{ transformOrigin: 'top left' }}
        />
        {children}
      </Box>
    </Box>
  );
};

export default PhonePreview;

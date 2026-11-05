import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

interface OuterContainerProps {
  className?: string;
  bubbleSize: number;
  children: React.ReactNode;
}

export const OuterContainer = ({
  className,
  bubbleSize,
  children,
}: OuterContainerProps) => {
  const containerHeight = bubbleSize + 2;

  return (
    <Box
      className={className}
      height={`${containerHeight}px`}
      data-testid="avatarBubblesContainer"
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      flexShrink={0}
      style={{ lineHeight: `${containerHeight}px` }}
    >
      {children}
    </Box>
  );
};

interface BubbleContainerProps {
  bubbleSize: number;
  overlap: number;
  avatarImagesCount: number;
  children: React.ReactNode;
}

export const BubbleContainer = ({
  bubbleSize,
  overlap,
  avatarImagesCount,
  children,
}: BubbleContainerProps) => {
  const containerHeight = bubbleSize + 2;

  return (
    <Box style={{ display: ' inline-block' }}>
      <Box
        display="flex"
        style={{
          position: 'relative',
          width: `${
            bubbleSize + (avatarImagesCount - 1) * (bubbleSize - overlap)
          }px`,
          minWidth: `${bubbleSize}px`,
          height: `${containerHeight}px`,
        }}
        alignItems="center"
      >
        {children}
      </Box>
    </Box>
  );
};

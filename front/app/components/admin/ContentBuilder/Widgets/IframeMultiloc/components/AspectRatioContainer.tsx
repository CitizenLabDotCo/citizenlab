import React, { ReactNode } from 'react';

import styled from 'styled-components';

import { AspectRatioType } from '../utils';

interface Props {
  aspectRatio: AspectRatioType;
  customAspectRatio?: string;
  children: ReactNode;
}

const calculateAspectRatioPercentage = (
  aspectRatio: AspectRatioType,
  customAspectRatio?: string
): number => {
  if (aspectRatio === 'custom' && customAspectRatio) {
    const [width, height] = customAspectRatio.split(':').map(Number);
    if (width > 0 && height > 0) {
      return (height / width) * 100;
    }
    return 56.25; // Fallback for invalid custom ratio
  }

  const ratios: Record<AspectRatioType, number> = {
    '16:9': 56.25, // 9/16 * 100
    '4:3': 75, // 3/4 * 100
    '3:4': 133.33, // 4/3 * 100
    '1:1': 100, // 1/1 * 100
    custom: 56.25, // fallback
  };

  return ratios[aspectRatio] || 56.25;
};

const Container = styled.div<{ aspectRatioPercentage: number }>`
  overflow: hidden;
  padding-bottom: ${({ aspectRatioPercentage }) => aspectRatioPercentage}%;
  position: relative;
  height: 0;

  iframe {
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    position: absolute;
  }
`;

const AspectRatioContainer = ({
  aspectRatio,
  customAspectRatio,
  children,
}: Props) => {
  const aspectRatioPercentage = calculateAspectRatioPercentage(
    aspectRatio,
    customAspectRatio
  );

  return (
    <Container aspectRatioPercentage={aspectRatioPercentage}>
      {children}
    </Container>
  );
};

export default AspectRatioContainer;

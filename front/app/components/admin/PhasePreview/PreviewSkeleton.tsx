import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';

import SkeletonBar from 'components/ProjectPageBuilder/Widgets/EmptyState/SkeletonBar';

interface Props {
  kind?: 'text' | 'cards' | 'form' | 'document';
}

const PreviewSkeleton = ({ kind = 'cards' }: Props) => (
  <Box
    data-cy="e2e-phase-preview-skeleton"
    aria-hidden
    display="flex"
    flexDirection="column"
    gap="16px"
    width="100%"
  >
    {kind === 'text' ? (
      <>
        <SkeletonBar width="95%" />
        <SkeletonBar width="85%" />
        <SkeletonBar width="60%" />
      </>
    ) : (
      Array.from({ length: kind === 'document' ? 1 : 3 }, (_, index) => (
        <Box
          key={index}
          p="20px"
          background={colors.white}
          borderRadius={stylingConsts.borderRadius}
          display="flex"
          flexDirection="column"
          gap="12px"
          minHeight={kind === 'document' ? '280px' : undefined}
        >
          <SkeletonBar width="65%" height="16px" />
          <SkeletonBar width="90%" />
          <SkeletonBar width="75%" />
          {kind === 'form' && <SkeletonBar height="40px" />}
        </Box>
      ))
    )}
  </Box>
);

export default PreviewSkeleton;

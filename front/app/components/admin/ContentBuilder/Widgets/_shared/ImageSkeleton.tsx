import React from 'react';

import {
  Shimmer,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';

const StyledShimmer = styled(Shimmer)`
  width: 100%;
  display: flex;
  aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO};
  margin-right: 10px;
  overflow: hidden;
  border-radius: ${stylingConsts.borderRadius};
`;

const ImageSkeleton = () => {
  return <StyledShimmer bgColor={colors.grey300} />;
};

export default ImageSkeleton;

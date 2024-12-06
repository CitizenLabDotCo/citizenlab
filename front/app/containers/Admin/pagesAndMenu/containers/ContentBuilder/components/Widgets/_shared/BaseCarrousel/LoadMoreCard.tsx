import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';

interface Props {
  width: number;
  cardRef: (node?: Element | null) => void;
}

const LoadMoreCard = ({ width, cardRef }: Props) => {
  return (
    <Box>
      <Box
        ref={cardRef}
        w={`${width}px`}
        h={`${width / CARD_IMAGE_ASPECT_RATIO}px`}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner />
      </Box>
    </Box>
  );
};

export default LoadMoreCard;

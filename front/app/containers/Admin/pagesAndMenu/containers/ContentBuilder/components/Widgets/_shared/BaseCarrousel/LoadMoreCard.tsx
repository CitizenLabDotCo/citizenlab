import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';

import { CardContainer } from './Containers';

interface Props {
  width: number;
  isLoading: boolean;
  onClick: () => void;
}

const LoadMoreCard = ({ width, isLoading, onClick }: Props) => {
  return (
    <CardContainer>
      <Box
        as="button"
        w={`${width}px`}
        h={`${width / CARD_IMAGE_ASPECT_RATIO}px`}
        display="flex"
        justifyContent="center"
        alignItems="center"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {isLoading ? <Spinner /> : <>Load more</>}
        {/* TODO */}
      </Box>
    </CardContainer>
  );
};

export default LoadMoreCard;

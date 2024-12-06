import React from 'react';

import { media, Box, Spinner } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';

const CardContainer = styled.div`
  ${media.phone`
      margin-right: 100vw;
  `}
`;

interface Props {
  width: number;
  cardRef: (node?: Element | null) => void;
}

const LoadMoreCard = ({ width, cardRef }: Props) => {
  return (
    <CardContainer>
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
    </CardContainer>
  );
};

export default LoadMoreCard;

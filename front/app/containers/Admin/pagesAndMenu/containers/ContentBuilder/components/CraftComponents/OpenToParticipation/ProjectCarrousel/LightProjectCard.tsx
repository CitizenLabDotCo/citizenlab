import React from 'react';

import {
  Box,
  Image,
  Title,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';

import ImagePlaceholder from 'components/ProjectCard/ImagePlaceholder';

interface Props {
  imageUrl?: string;
}

const ProjectImageContainer = styled.div`
  width: 100%;
  display: flex;
  aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO} / 1;
  margin-right: 10px;
  overflow: hidden;
  position: relative;
  border-radius: ${stylingConsts.borderRadius};
`;

const LightProjectCard = ({ imageUrl }: Props) => {
  return (
    <Box w="240px">
      <Box>
        <ProjectImageContainer>
          {imageUrl ? <Image src={imageUrl} alt="" /> : <ImagePlaceholder />}
        </ProjectImageContainer>
      </Box>
      <Title variant="h5">Test</Title>
    </Box>
  );
};

export default LightProjectCard;

import React from 'react';

import {
  Box,
  Image,
  Icon,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';

import ImagePlaceholder from 'components/ProjectCard/ImagePlaceholder';

const ProjectImageContainer = styled.div`
  width: 100%;
  display: flex;
  aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO * 2};
  margin-right: 10px;
  overflow: hidden;
  position: relative;
  border-radius: ${stylingConsts.borderRadius};

  & > * {
    transition: transform 0.3s;
  }
`;

interface Props {
  imageUrl?: string;
  alt?: string;
  showStamp: boolean;
}

const CardImage = ({ imageUrl, alt, showStamp }: Props) => {
  return (
    <Box>
      <ProjectImageContainer className="project-image-container">
        {showStamp && (
          <Box top="4px" right="4px" position="absolute" zIndex="1000">
            <Icon
              name="checkmarkStamp"
              fill={colors.teal300}
              width="30px"
              height="30px"
            />
          </Box>
        )}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt ?? ''}
            position="absolute"
            width="100%"
            height="100%"
            top="0"
            left="0"
            objectFit="cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </ProjectImageContainer>
    </Box>
  );
};

export default CardImage;

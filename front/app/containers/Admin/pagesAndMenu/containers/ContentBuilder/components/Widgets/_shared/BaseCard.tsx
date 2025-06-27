import React from 'react';

import { Box, Image, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';

import ImagePlaceholder from 'components/ProjectCard/ImagePlaceholder';

export const CardContainer = styled(Box)`
  &:focus-visible {
    margin-left: 12px;
    margin-top: 2px;
    margin-bottom: 2px;
  }
  &:hover {
    h3 {
      color: ${({ theme }) => theme.colors.tenantPrimary};
      text-decoration: underline;
    }

    .project-image-container > * {
      transform: scale(1.2);
    }
  }
`;

const ProjectImageContainer = styled.div`
  width: 100%;
  display: flex;
  aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO};
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
}

export const CardImage = ({ imageUrl, alt }: Props) => {
  return (
    <Box>
      <ProjectImageContainer className="project-image-container">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt ?? ''}
            position="absolute"
            width="100%"
            height="100%"
            top="0"
            left="0"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </ProjectImageContainer>
    </Box>
  );
};

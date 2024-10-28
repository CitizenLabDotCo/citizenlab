import React from 'react';

import {
  Box,
  Image,
  Title,
  Text,
  stylingConsts,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';

import PhaseTimeLeft from 'components/PhaseTimeLeft';
import ImagePlaceholder from 'components/ProjectCard/ImagePlaceholder';

interface Props {
  title: string;
  imageUrl?: string;
  currentPhaseEndsAt: string;
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

const LightProjectCard = ({ title, imageUrl, currentPhaseEndsAt }: Props) => {
  return (
    <Box w="240px">
      <Box>
        <ProjectImageContainer>
          {imageUrl ? <Image src={imageUrl} alt="" /> : <ImagePlaceholder />}
        </ProjectImageContainer>
      </Box>
      <Title variant="h4" mt="8px" mb="0px" fontWeight="600">
        {title}
      </Title>
      <Box mt="8px">
        <Icon
          name="clock-circle"
          fill={colors.blue500}
          height="16px"
          mr="4px"
          ml="-4px"
          transform="translate(0,-1)"
        />
        <Text color="blue500" fontWeight="600" display="inline" m="0">
          <PhaseTimeLeft currentPhaseEndsAt={currentPhaseEndsAt} />
        </Text>
      </Box>
    </Box>
  );
};

export default LightProjectCard;

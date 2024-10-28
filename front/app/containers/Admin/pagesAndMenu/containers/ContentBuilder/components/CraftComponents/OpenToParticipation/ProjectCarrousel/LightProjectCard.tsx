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

import usePhase from 'api/phases/usePhase';
import useProjectImage from 'api/project_images/useProjectImage';
import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import PhaseTimeLeft from 'components/PhaseTimeLeft';
import getCTAMessage from 'components/ProjectCard/getCTAMessage';
import ImagePlaceholder from 'components/ProjectCard/ImagePlaceholder';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ProjectImageContainer = styled.div`
  width: 100%;
  display: flex;
  aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO} / 1;
  margin-right: 10px;
  overflow: hidden;
  position: relative;
  border-radius: ${stylingConsts.borderRadius};
`;

interface Props {
  project: IProjectData;
}

const LightProjectCard = ({ project }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const imageId = project.relationships.project_images?.data[0]?.id;
  const { data: image } = useProjectImage({
    projectId: project.id,
    imageId,
  });

  const phaseId = project.relationships.current_phase?.data?.id;
  const { data: phase } = usePhase(phaseId);

  if (!phase) return null;

  const title = localize(project.attributes.title_multiloc);
  const imageUrl = image?.data.attributes.versions.medium;
  const { end_at } = phase.data.attributes;

  return (
    <Box w="240px">
      <Box>
        <ProjectImageContainer>
          {imageUrl ? <Image src={imageUrl} alt="" /> : <ImagePlaceholder />}
        </ProjectImageContainer>
      </Box>
      <Title variant="h4" mt="8px" mb="0px" fontWeight="bold">
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
        <Text color="blue500" fontWeight="bold" display="inline" m="0">
          {end_at ? (
            <PhaseTimeLeft currentPhaseEndsAt={end_at} />
          ) : (
            <>{formatMessage(messages.noEndDate)}</>
          )}
        </Text>
        <Text mt="4px" mb="0px" color="textSecondary" fontWeight="bold">
          {getCTAMessage({
            phase: phase.data,
            project,
            localize,
            formatMessage,
          })}
        </Text>
      </Box>
    </Box>
  );
};

export default LightProjectCard;

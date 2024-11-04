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
import { RouteType } from 'routes';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';
import useProjectImage from 'api/project_images/useProjectImage';
import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';
import { getProjectUrl } from 'api/projects/utils';
import { MiniProjectData } from 'api/projects_mini/types';

import useLocalize from 'hooks/useLocalize';

import PhaseTimeLeft from 'components/PhaseTimeLeft';
import getCTAMessage from 'components/ProjectCard/getCTAMessage';
import ImagePlaceholder from 'components/ProjectCard/ImagePlaceholder';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import { CARD_WIDTH } from './constants';
import messages from './messages';

const CardContainer = styled(Box)`
  &:hover {
    h4 {
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
  project: MiniProjectData;
  onKeyDown?: React.KeyboardEventHandler<HTMLAnchorElement> &
    React.KeyboardEventHandler<HTMLDivElement>;
}

const LightProjectCard = ({ project, onKeyDown }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const imageId = project.relationships.project_images.data[0]?.id;
  const { data: image } = useProjectImage({
    projectId: project.id,
    imageId,
  });

  const phaseId = project.relationships.current_phase.data.id;
  const { data: phase } = usePhase(phaseId);

  if (!phase) return null;

  const title = localize(project.attributes.title_multiloc);
  const imageVersions = image?.data.attributes.versions;
  const imageUrl = imageVersions?.large ?? imageVersions?.medium;

  const { end_at } = phase.data.attributes;
  const projectUrl: RouteType = getProjectUrl(project.attributes.slug);

  return (
    <CardContainer
      as={Link}
      tabIndex={0}
      w={`${CARD_WIDTH}px`}
      to={projectUrl}
      display="block"
      onKeyDown={onKeyDown}
    >
      <Box>
        <ProjectImageContainer className="project-image-container">
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
            actionDescriptors: project.attributes.action_descriptors,
            localize,
            formatMessage,
          })}
        </Text>
      </Box>
    </CardContainer>
  );
};

export default LightProjectCard;

import React from 'react';

import {
  Box,
  Image,
  Text,
  stylingConsts,
  Title,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';
import useProjectImage from 'api/project_images/useProjectImage';
import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';
import { getProjectUrl } from 'api/projects/utils';
import { MiniProjectData } from 'api/projects_mini/types';

import useLocalize from 'hooks/useLocalize';

import getCTAMessage from 'components/ProjectCard/getCTAMessage';
import ImagePlaceholder from 'components/ProjectCard/ImagePlaceholder';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { truncate } from 'utils/textUtils';

import { CARD_WIDTH } from '../constants';

import TimeIndicator from './TimeIndicator';

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
  ml?: string;
  mr?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLAnchorElement> &
    React.KeyboardEventHandler<HTMLDivElement>;
}

const LightProjectCard = ({ project, ml, mr, onKeyDown }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const imageId = project.relationships.project_images.data[0]?.id;
  const { data: image } = useProjectImage({
    projectId: project.id,
    imageId,
  });

  const phaseId = project.relationships.current_phase?.data?.id;
  const { data: phase } = usePhase(phaseId);

  const title = localize(project.attributes.title_multiloc);
  const imageVersions = image?.data.attributes.versions;
  const imageUrl = imageVersions?.large ?? imageVersions?.medium;

  const projectUrl: RouteType = getProjectUrl(project.attributes.slug);

  return (
    <CardContainer
      as={Link}
      tabIndex={0}
      w={`${CARD_WIDTH}px`}
      ml={ml}
      mr={mr}
      to={projectUrl}
      display="block"
      onKeyDown={onKeyDown}
    >
      <Box>
        <ProjectImageContainer className="project-image-container">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
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
      <Title variant="h4" as="h3" mt="8px" mb="0px">
        {truncate(title, 50)}
      </Title>
      <Box mt="8px">
        <TimeIndicator
          currentPhaseEndsAt={phase?.data.attributes.end_at}
          projectStartsInDays={project.attributes.starts_days_from_now}
          projectEndedDaysAgo={project.attributes.ended_days_ago}
        />
        {phase && (
          <Text mt="2px" mb="0px" color="textSecondary">
            {getCTAMessage({
              phase: phase.data,
              actionDescriptors: project.attributes.action_descriptors,
              localize,
              formatMessage,
            })}
          </Text>
        )}
      </Box>
    </CardContainer>
  );
};

export default LightProjectCard;

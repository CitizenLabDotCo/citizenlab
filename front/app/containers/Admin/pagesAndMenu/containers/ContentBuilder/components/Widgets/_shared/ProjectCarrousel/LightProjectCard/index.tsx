import React from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import usePhaseMini from 'api/phases_mini/usePhaseMini';
import useProjectImage from 'api/project_images/useProjectImage';
import { getProjectUrl } from 'api/projects/utils';
import { MiniProjectData } from 'api/projects_mini/types';
import useReport from 'api/reports/useReport';

import useLocalize from 'hooks/useLocalize';

import getCTAMessage from 'components/ProjectCard/getCTAMessage';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import { CardContainer, CardImage } from '../../BaseCard';
import { CARD_WIDTH } from '../constants';

import TimeIndicator from './TimeIndicator';

interface Props {
  project: MiniProjectData;
  ml?: string;
  mr?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLAnchorElement> &
    React.KeyboardEventHandler<HTMLElement>;
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
  const { data: phase } = usePhaseMini(phaseId);
  const { data: report } = useReport(
    phase?.data.relationships.report?.data?.id
  );
  const hasPublicReport = !!report?.data.attributes.visible;

  const title = localize(project.attributes.title_multiloc);
  const imageVersions = image?.data.attributes.versions;
  const imageUrl = imageVersions?.large ?? imageVersions?.medium;
  const imageAltText = localize(image?.data.attributes.alt_text_multiloc);

  const projectUrl: RouteType = getProjectUrl(project.attributes.slug);

  return (
    <CardContainer
      as={Link}
      scrollToTop
      tabIndex={0}
      w={`${CARD_WIDTH}px`}
      ml={ml}
      mr={mr}
      to={projectUrl}
      display="block"
      onKeyDown={onKeyDown}
      data-cy="e2e-light-project-card"
    >
      <CardImage imageUrl={imageUrl ?? undefined} alt={imageAltText} />
      <Title variant="h3" fontSize="m" mt="8px" mb="0px" color="tenantText">
        {title}
      </Title>
      <Box mt="8px">
        <TimeIndicator
          currentPhaseEndsAt={phase?.data.attributes.end_at}
          projectStartsInDays={project.attributes.starts_days_from_now}
          projectEndedDaysAgo={project.attributes.ended_days_ago}
        />
        {phase && project.attributes.action_descriptors && (
          <Text mt="2px" mb="0px" color="textSecondary">
            {getCTAMessage({
              phase: phase.data,
              actionDescriptors: project.attributes.action_descriptors,
              localize,
              formatMessage,
              hasPublicReport,
            })}
          </Text>
        )}
      </Box>
    </CardContainer>
  );
};

export default LightProjectCard;

import React from 'react';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'hooks/usePhase';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  projectId?: string;
  phaseId?: string;
}

const ProjectInfo = ({ projectId, phaseId }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const phase = usePhase(phaseId ?? null);

  if (!project) return null;

  if (
    project.data.attributes.process_type === 'continuous' &&
    project.data.attributes.participation_method !== 'ideation'
  ) {
    return null;
  }

  if (
    project.data.attributes.process_type === 'timeline' &&
    isNilOrError(phase)
  ) {
    return null;
  }

  const projectTitle = localize(project.data.attributes.title_multiloc);

  const hasPhase =
    project.data.attributes.process_type === 'timeline' && !isNilOrError(phase);
  const ideasCount = hasPhase
    ? phase.attributes.ideas_count
    : project.data.attributes.ideas_count;

  return (
    <Box ml="16px">
      <Text mt="4px" mb="4px" color="primary">
        {'| '}
        {projectTitle}
        {hasPhase ? ` (${localize(phase.attributes.title_multiloc)})` : ''}
      </Text>
      <Text mt="4px" mb="4px" color="textSecondary" fontSize="s">
        {formatMessage(messages.totalIdeas, { numberOfIdeas: ideasCount })}
      </Text>
    </Box>
  );
};

export default ProjectInfo;

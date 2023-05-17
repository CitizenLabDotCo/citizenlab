import React from 'react';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'api/phases/usePhase';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';

interface Props {
  projectId?: string;
  phaseId?: string;
}

const ProjectInfo = ({ projectId, phaseId }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  if (!project) return null;

  if (
    project.data.attributes.process_type === 'continuous' &&
    project.data.attributes.participation_method !== 'ideation'
  ) {
    return null;
  }

  if (project.data.attributes.process_type === 'timeline' && !phase) {
    return null;
  }

  const projectTitle = localize(project.data.attributes.title_multiloc);

  const hasPhase = project.data.attributes.process_type === 'timeline' && phase;
  const ideasCount = hasPhase
    ? phase.data.attributes.ideas_count
    : project.data.attributes.ideas_count;

  return (
    <Box ml="16px">
      <Text mt="4px" mb="4px" color="primary">
        {'| '}
        {projectTitle}
        {hasPhase ? ` (${localize(phase.data.attributes.title_multiloc)})` : ''}
      </Text>
      <Text mt="4px" mb="4px" color="textSecondary" fontSize="s">
        {formatMessage(messages.totalIdeas, { numberOfIdeas: ideasCount })}
      </Text>
    </Box>
  );
};

export default ProjectInfo;

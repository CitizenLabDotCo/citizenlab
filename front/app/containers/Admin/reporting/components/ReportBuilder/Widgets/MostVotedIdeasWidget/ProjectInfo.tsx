import React from 'react';

// hooks
import useProject from 'hooks/useProject';
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
  const project = useProject({ projectId });
  const phase = usePhase(phaseId ?? null);

  if (isNilOrError(project)) return null;

  if (
    project.attributes.process_type === 'continuous' &&
    project.attributes.participation_method !== 'ideation'
  ) {
    return null;
  }

  if (project.attributes.process_type === 'timeline' && isNilOrError(phase)) {
    return null;
  }

  const projectTitle = localize(project.attributes.title_multiloc);

  const hasPhase =
    project.attributes.process_type === 'timeline' && !isNilOrError(phase);
  const ideasCount = hasPhase
    ? phase.attributes.ideas_count
    : project.attributes.ideas_count;

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

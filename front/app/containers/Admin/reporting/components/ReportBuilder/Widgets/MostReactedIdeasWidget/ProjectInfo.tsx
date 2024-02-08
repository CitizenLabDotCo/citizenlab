import React from 'react';

// types
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const ProjectInfo = ({ project, phase }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const projectTitle = localize(project.attributes.title_multiloc);

  const ideasCount = phase
    ? phase.attributes.ideas_count
    : project.attributes.ideas_count;

  return (
    <Box>
      <Text mt="4px" mb="4px">
        {'| '}
        {projectTitle}
        {phase ? ` (${localize(phase.attributes.title_multiloc)})` : ''}
      </Text>
      <Text mt="4px" mb="4px" color="textSecondary" fontSize="s">
        {formatMessage(messages.totalIdeas, { numberOfIdeas: ideasCount })}
      </Text>
    </Box>
  );
};

export default ProjectInfo;

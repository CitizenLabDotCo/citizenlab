import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
}

const ProjectInfo = ({ project, phase }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const projectTitle = localize(project.attributes.title_multiloc);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const ideasCount = phase
    ? phase.attributes.ideas_count
    : project.attributes.ideas_count;

  return (
    <Box>
      <Text mt="4px" mb="4px">
        {'| '}
        {projectTitle}
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {phase ? ` (${localize(phase.attributes.title_multiloc)})` : ''}
      </Text>
      <Text mt="4px" mb="4px" color="textSecondary" fontSize="s">
        {formatMessage(messages.totalIdeas, { numberOfIdeas: ideasCount })}
      </Text>
    </Box>
  );
};

export default ProjectInfo;

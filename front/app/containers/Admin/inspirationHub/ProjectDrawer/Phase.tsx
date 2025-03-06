import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useProjectLibraryPhase from 'api/project_library_phases/useProjectLibraryPhase';
import { ProjectLibraryProjectData } from 'api/project_library_projects/types';

import { useIntl } from 'utils/cl-intl';

import ExternalLink from './ExternalLink';
import messages from './messages';
import { getPhaseURL } from './utils';

interface Props {
  attributes: ProjectLibraryProjectData['attributes'];
  projectLibraryPhaseId: string;
  phaseNumber: number;
}

const Phase = ({ attributes, projectLibraryPhaseId, phaseNumber }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phase } = useProjectLibraryPhase(projectLibraryPhaseId);
  if (!phase) return null;

  return (
    <Box>
      <Title variant="h3">
        {formatMessage(messages.phaseTitle, {
          number: phaseNumber,
          title: phase.data.attributes.title_en,
        })}
      </Title>
      <ExternalLink href={getPhaseURL(attributes, phaseNumber)}>
        {formatMessage(messages.readMore)}
      </ExternalLink>
    </Box>
  );
};

export default Phase;

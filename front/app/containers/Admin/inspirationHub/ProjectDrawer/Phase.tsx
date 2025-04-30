import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useProjectLibraryPhase from 'api/project_library_phases/useProjectLibraryPhase';
import { ProjectLibraryProjectData } from 'api/project_library_projects/types';

import { useIntl } from 'utils/cl-intl';
import { parseBackendDateString } from 'utils/dateUtils';

import MethodLabel from '../components/MethodLabel';
import { useLocalizeProjectLibrary } from '../utils';

import ExternalLink from './ExternalLink';
import messages from './messages';
import { formatDate, getPhaseURL } from './utils';

interface Props {
  projectAttributes: ProjectLibraryProjectData['attributes'];
  projectLibraryPhaseId: string;
  phaseNumber: number;
}

const Phase = ({
  projectAttributes,
  projectLibraryPhaseId,
  phaseNumber,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: phase } = useProjectLibraryPhase(projectLibraryPhaseId);
  const localizeProjectLibrary = useLocalizeProjectLibrary();
  if (!phase) return null;

  const phaseAttributes = phase.data.attributes;

  const startAt = parseBackendDateString(phaseAttributes.start_at);
  const endAt = phaseAttributes.end_at
    ? parseBackendDateString(phaseAttributes.end_at)
    : undefined;

  return (
    <Box>
      <Title variant="h3" mb="4px">
        {formatMessage(messages.phaseTitle, {
          number: phaseNumber,
          title: localizeProjectLibrary(
            phaseAttributes.title_multiloc,
            phaseAttributes.title_en
          ),
        })}
      </Title>
      <Box display="flex" flexDirection="row" alignItems="center">
        <Box mr="8px">
          {formatDate(startAt)} -{' '}
          {formatDate(endAt) ?? formatMessage(messages.openEnded)}
        </Box>
        <MethodLabel
          participationMethod={phase.data.attributes.participation_method}
        />
      </Box>
      <ExternalLink href={getPhaseURL(projectAttributes, phaseNumber)}>
        {formatMessage(messages.readMore)}
      </ExternalLink>
    </Box>
  );
};

export default Phase;

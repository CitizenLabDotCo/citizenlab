import React from 'react';

import {
  Title,
  Text,
  Toggle,
  Box,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import { FormattedMessage } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import PhasePermissions from '../../components/PhasePermissions';
import PhasePermissionsNew from '../../components/PhasePermissionsNew';
import messages from '../../messages';

const Phase = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const [search] = useSearchParams();
  const newSystemActive = !!search.get('new_system');

  const { data: phase } = usePhase(phaseId || null);
  const { data: project } = useProjectById(projectId);

  if (!phase || !project) return null;

  return (
    <Box mb="48px">
      <Title variant="h2" color="primary">
        <FormattedMessage {...messages.participationRequirementsTitle} />
      </Title>
      <Toggle
        checked={newSystemActive}
        onChange={() => {
          newSystemActive
            ? removeSearchParams(['new_system'])
            : updateSearchParams({ new_system: true });
        }}
        label="Use new system"
        labelTextColor={colors.primary}
      />
      <Text color="coolGrey600" pb="8px">
        <FormattedMessage {...messages.participationRequirementsSubtitle} />
      </Text>
      {newSystemActive ? (
        <PhasePermissionsNew project={project.data} phase={phase.data} />
      ) : (
        <PhasePermissions project={project.data} phase={phase.data} />
      )}
    </Box>
  );
};

export default Phase;

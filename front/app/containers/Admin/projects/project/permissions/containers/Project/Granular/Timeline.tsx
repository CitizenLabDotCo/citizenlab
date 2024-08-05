import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import messages from 'containers/Admin/projects/project/permissions/components/PhasePermissions/messages';

import { FormattedMessage } from 'utils/cl-intl';

import PhasePermissions from '../../../components/PhasePermissions';

interface Props {
  projectId: string;
}

const Timeline = ({ projectId }: Props) => {
  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);

  if (!phases || !project) {
    return null;
  }

  return (
    <Box mb="20px">
      {phases.data &&
        phases.data.length > 0 &&
        phases.data.map((phase, i) => (
          <PhasePermissions
            project={project.data}
            phase={phase}
            key={phase.id}
            phaseNumber={i + 1}
          />
        ))}
      {!phases.data ||
        (phases.data.length < 1 && (
          <p>
            <FormattedMessage {...messages.noActionsCanBeTakenInThisProject} />
          </p>
        ))}
    </Box>
  );
};

export default Timeline;

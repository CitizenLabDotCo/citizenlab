import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'components/admin/ActionsForm/messages';

import { FormattedMessage } from 'utils/cl-intl';

import PhasePermissions from '../../../components/PhasePermissions';
import PhasePermissionsNew from '../../../components/PhasePermissionsNew';

interface Props {
  projectId: string;
}

const Timeline = ({ projectId }: Props) => {
  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);
  const isCustomPermittedByEnabled = useFeatureFlag({
    name: 'custom_permitted_by',
  });

  if (!phases || !project) {
    return null;
  }

  return (
    <Box mb="20px">
      {phases.data &&
        phases.data.length > 0 &&
        phases.data.map((phase, i) => {
          if (isCustomPermittedByEnabled) {
            return (
              <PhasePermissionsNew
                project={project.data}
                phase={phase}
                key={phase.id}
                // phaseNumber={i + 1}
              />
            );
          }

          return (
            <PhasePermissions
              project={project.data}
              phase={phase}
              key={phase.id}
              phaseNumber={i + 1}
            />
          );
        })}
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

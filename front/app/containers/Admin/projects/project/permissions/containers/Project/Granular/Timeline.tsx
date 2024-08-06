import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';

import messages from 'containers/Admin/projects/project/permissions/components/ActionForms/messages';

import { FormattedMessage } from 'utils/cl-intl';

import ActionForms from '../../../components/ActionForms';
import PhaseAccordion from '../../../components/PhaseAccordion';

interface Props {
  projectId: string;
}

const Timeline = ({ projectId }: Props) => {
  const { data: phases } = usePhases(projectId);

  if (!phases) {
    return null;
  }

  return (
    <Box mb="20px">
      {phases.data &&
        phases.data.length > 0 &&
        phases.data.map((phase, i) => (
          <PhaseAccordion
            phaseTitle={phase.attributes.title_multiloc}
            phaseNumber={i + 1}
            key={phase.id}
          >
            <Box
              minHeight="100px"
              display="flex"
              flex={'1'}
              flexDirection="column"
              background={colors.white}
            >
              <Box mb="40px">
                <ActionForms phaseId={phase.id} />
              </Box>
            </Box>
          </PhaseAccordion>
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

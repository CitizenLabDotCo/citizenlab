import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import ActionForms from './ActionForms';
import PhaseAccordion from './PhaseAccordion';

interface Props {
  phase: IPhaseData;
  phaseNumber?: number;
}

const PhasePermissions = ({ phase, phaseNumber }: Props) => {
  const config = getMethodConfig(phase.attributes.participation_method);

  const phaseMarkup = (
    <Box
      minHeight="100px"
      display="flex"
      flex={'1'}
      flexDirection="column"
      background={colors.white}
    >
      <Box mb="40px">
        <ActionForms postType={config.postType} phaseId={phase.id} />
      </Box>
    </Box>
  );

  const showAccordion = phaseNumber !== undefined;

  if (showAccordion) {
    return (
      <PhaseAccordion
        phaseTitle={phase.attributes.title_multiloc}
        phaseNumber={phaseNumber}
      >
        {phaseMarkup}
      </PhaseAccordion>
    );
  }

  return phaseMarkup;
};

export default PhasePermissions;

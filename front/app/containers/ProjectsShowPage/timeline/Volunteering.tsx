import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import Volunteering from '../shared/volunteering';

interface Props {
  phase: IPhaseData;
  className?: string;
}

const VolunteeringContainer = ({ className, phase }: Props) => (
  <Box
    className={`e2e-timeline-project-volunteering-container ${className || ''}`}
  >
    <Volunteering phase={phase} />
  </Box>
);

export default VolunteeringContainer;

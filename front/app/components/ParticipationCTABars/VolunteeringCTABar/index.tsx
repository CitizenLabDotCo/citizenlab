import React, { useEffect, useState, FormEvent } from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase } from 'api/phases/utils';

import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import {
  CTABarProps,
  useScrollToCurrentPhaseElement,
} from 'components/ParticipationCTABars/utils';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const VolunteeringCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const scrollToPhaseElement = useScrollToCurrentPhaseElement(project, phases);

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases));
  }, [phases]);

  const handleVolunteerClick = (event: FormEvent) => {
    event.preventDefault();
    scrollToPhaseElement('volunteering');
  };

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={
        <Button
          id="e2e-participation-cta-volunteer"
          onClick={handleVolunteerClick}
          fontWeight="500"
          bgColor={theme.colors.white}
          textColor={theme.colors.tenantText}
          textHoverColor={theme.colors.black}
          padding="6px 12px"
          fontSize="14px"
          width="100%"
        >
          <FormattedMessage {...messages.volunteer} />
        </Button>
      }
    />
  );
};

export default VolunteeringCTABar;

import React, { useEffect, useState, FormEvent } from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase } from 'api/phases/utils';

import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import { CTABarProps } from 'components/ParticipationCTABars/utils';

import { FormattedMessage } from 'utils/cl-intl';
import { scrollToElement } from 'utils/scroll';

import messages from '../messages';

const VolunteeringCTABar = ({ phases }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases));
  }, [phases]);

  const handleVolunteerClick = (event: FormEvent) => {
    event.preventDefault();
    scrollToElement({ id: 'volunteering', shouldFocus: true });
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

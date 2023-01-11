import React, { useEffect, useState, FormEvent } from 'react';

// Components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import {
  CTABarProps,
  hasRrojectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

// utils
import { scrollToElement } from 'utils/scroll';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export const VolunteeringCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  const handleVolunteerClick = (event: FormEvent) => {
    event.preventDefault();
    scrollToElement({ id: 'volunteering', shouldFocus: true });
  };

  if (hasRrojectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const CTAButton = (
    <Button
      id="e2e-participation-cta-volunteer"
      buttonStyle="primary"
      onClick={handleVolunteerClick}
      fontWeight="500"
      bgColor={theme.colors.white}
      textColor={theme.colors.tenantText}
      iconColor={theme.colors.tenantText}
    >
      <FormattedMessage {...messages.volunteer} />
    </Button>
  );

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={CTAButton}
    />
  );
};

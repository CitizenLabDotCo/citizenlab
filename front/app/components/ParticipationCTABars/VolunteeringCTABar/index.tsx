import React, { useEffect, useState, FormEvent } from 'react';

// Components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { CTABarProps } from 'components/ParticipationCTABars/utils';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';
import { scrollToElement } from 'utils/scroll';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export const VolunteeringCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);
  const hasProjectEnded = currentPhase
    ? pastPresentOrFuture([
        currentPhase.attributes.start_at,
        currentPhase.attributes.end_at,
      ]) === 'past'
    : false;

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  const scrollTo = (id: string) => (event: FormEvent) => {
    event.preventDefault();
    scrollToElement({ id, shouldFocus: true });
  };

  const handleVolunteerClick = (event: FormEvent) => {
    scrollTo('volunteering')(event);
  };

  const { publication_status } = project.attributes;

  if (hasProjectEnded || publication_status === 'archived') {
    return null;
  }

  const CTAButton = (
    <Button
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

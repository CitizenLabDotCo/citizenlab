import React, { useEffect, useState, FormEvent, useCallback } from 'react';

// Components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { IProjectData } from 'services/projects';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';
import { scrollToElement } from 'utils/scroll';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// router
import { useLocation } from 'react-router-dom';

type CTAProps = {
  project: IProjectData;
  phases: Error | IPhaseData[] | null | undefined;
};

export const VolunteeringCTABar = ({ phases, project }: CTAProps) => {
  const theme = useTheme();
  const { pathname } = useLocation();
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

  const scrollTo = useCallback(
    (id: string) => (event: FormEvent) => {
      event.preventDefault();

      scrollToElement({ id, shouldFocus: true });
    },
    [currentPhase, project, pathname]
  );

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

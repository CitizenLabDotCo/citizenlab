import React, { useEffect, useState, FormEvent } from 'react';

// Components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';

// services
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

// utils
import { scrollToElement } from 'utils/scroll';
import { isFixableByAuthentication } from 'utils/actionDescriptors';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export const VolunteeringCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  const { enabled, disabled_reason } =
    project.attributes.action_descriptor.volunteering;

  // TODO: add causes to PC serializer
  const showVolunteer =
    (enabled || isFixableByAuthentication(disabled_reason)) &&
    pc.relationships.causes.size > 0;

  const handleVolunteerClick = (event: FormEvent) => {
    event.preventDefault();
    scrollToElement({ id: 'volunteering', shouldFocus: true });
  };

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const CTAButton = (
    <Button
      id="e2e-participation-cta-volunteer"
      onClick={handleVolunteerClick}
      fontWeight="500"
      bgColor={theme.colors.white}
      textColor={theme.colors.tenantText}
      textHoverColor={theme.colors.black}
      padding="6px 12px"
      fontSize="14px"
    >
      <FormattedMessage {...messages.volunteer} />
    </Button>
  );

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={showVolunteer ? CTAButton : null}
      project={project}
    />
  );
};

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

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export const PollCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  const handlePollClick = (event: FormEvent) => {
    event.preventDefault();
    scrollToElement({ id: 'project-poll', shouldFocus: true });
  };

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const CTAButton = (
    <Button
      id="e2e-participation-cta-poll"
      buttonStyle="primary"
      onClick={handlePollClick}
      fontWeight="500"
      bgColor={theme.colors.white}
      textColor={theme.colors.tenantText}
      textHoverColor={theme.colors.black}
      padding="6px 12px"
      fontSize="14px"
    >
      <FormattedMessage {...messages.poll} />
    </Button>
  );

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={CTAButton}
    />
  );
};

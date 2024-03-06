import React, { useEffect, useState, FormEvent } from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';

import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

import { FormattedMessage } from 'utils/cl-intl';
import { scrollToElement } from 'utils/scroll';

import messages from '../messages';

const PollCTABar = ({ phases, project }: CTABarProps) => {
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

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={
        <Button
          id="e2e-participation-cta-poll"
          onClick={handlePollClick}
          fontWeight="500"
          bgColor={theme.colors.white}
          textColor={theme.colors.tenantText}
          textHoverColor={theme.colors.black}
          padding="6px 12px"
          fontSize="14px"
          width="100%"
        >
          <FormattedMessage {...messages.poll} />
        </Button>
      }
    />
  );
};

export default PollCTABar;

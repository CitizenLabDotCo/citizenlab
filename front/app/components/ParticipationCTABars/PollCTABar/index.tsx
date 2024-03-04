import React, { useEffect, useState, FormEvent } from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';

import { useTheme } from 'styled-components';

import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

import { scrollToElement } from 'utils/scroll';

import { FormattedMessage } from 'utils/cl-intl';
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

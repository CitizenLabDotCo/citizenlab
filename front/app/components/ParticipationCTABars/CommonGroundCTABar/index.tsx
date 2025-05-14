import React, { useEffect, useState } from 'react';

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

import messages from '../messages';

const CommonGroundCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={
        <Button
          onClick={() => {
            // Handle scrollToElement
          }}
          fontWeight="500"
          bgColor={theme.colors.white}
          textColor={theme.colors.tenantText}
          textHoverColor={theme.colors.black}
          padding="6px 12px"
          fontSize="14px"
        >
          <FormattedMessage {...messages.viewInputs} />
        </Button>
      }
    />
  );
};

export default CommonGroundCTABar;

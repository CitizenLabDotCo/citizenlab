import React, { useEffect, useState } from 'react';

// Components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';
import useBasket from 'hooks/useBasket';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { IProjectData } from 'services/projects';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { pastPresentOrFuture } from 'utils/dateUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

type CTAProps = {
  project: IProjectData;
  phases: Error | IPhaseData[] | null | undefined;
};

export const BudgetingCTABar = ({ phases, project }: CTAProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);
  const hasProjectEnded = currentPhase
    ? pastPresentOrFuture([
        currentPhase.attributes.start_at,
        currentPhase.attributes.end_at,
      ]) === 'past'
    : false;

  let basketId: string | null = null;
  if (currentPhase) {
    basketId = !isNilOrError(currentPhase)
      ? currentPhase.relationships.user_basket?.data?.id || null
      : null;
  } else {
    basketId = project.relationships.user_basket?.data?.id || null;
  }
  const basket = useBasket(basketId);
  const hasUserParticipated = !!basket?.attributes.total_budget;

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  const { publication_status } = project.attributes;

  if (hasProjectEnded || publication_status === 'archived') {
    return null;
  }

  const CTAButton = hasUserParticipated ? null : (
    <Button
      buttonStyle="primary"
      onClick={() => {
        // TODO: Handle scroll to budget
      }}
      fontWeight="500"
      bgColor={theme.colors.white}
      textColor={theme.colors.tenantText}
      iconColor={theme.colors.tenantText}
    >
      <FormattedMessage {...messages.allocateYourBudget} />
    </Button>
  );

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={CTAButton}
      hasUserParticipated={hasUserParticipated}
    />
  );
};

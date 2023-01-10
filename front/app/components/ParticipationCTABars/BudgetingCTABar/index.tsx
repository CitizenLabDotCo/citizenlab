import React, { useEffect, useState, FormEvent } from 'react';

// Components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';
import useBasket from 'hooks/useBasket';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { scrollToElement } from 'utils/scroll';
import { CTABarProps } from 'components/ParticipationCTABars/utils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export const BudgetingCTABar = ({ phases, project }: CTABarProps) => {
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

  const scrollTo = (id: string) => (event: FormEvent) => {
    event.preventDefault();

    scrollToElement({ id, shouldFocus: true });
  };

  const handleAllocateBudgetClick = (event: FormEvent) => {
    scrollTo('pb-expenses')(event);
  };

  const CTAButton = hasUserParticipated ? null : (
    <Button
      buttonStyle="primary"
      onClick={handleAllocateBudgetClick}
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

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
import { scrollToElement } from 'utils/scroll';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { isNilOrError } from 'utils/helperUtils';

export const BudgetingCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  let basketId: string | null = null;
  if (currentPhase) {
    basketId = currentPhase.relationships.user_basket?.data?.id || null;
  } else {
    basketId = project.relationships.user_basket?.data?.id || null;
  }
  const basket = useBasket(basketId);
  const submittedAt = !isNilOrError(basket)
    ? basket.attributes.submitted_at
    : null;
  const spentBudget = !isNilOrError(basket)
    ? basket.attributes.total_budget
    : 0;
  const hasUserParticipated = !!submittedAt && spentBudget > 0;

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const handleAllocateBudgetClick = (event: FormEvent) => {
    event.preventDefault();

    scrollToElement({ id: 'pb-expenses', shouldFocus: true });
  };

  const CTAButton = hasUserParticipated ? null : (
    <Button
      buttonStyle="primary"
      onClick={handleAllocateBudgetClick}
      fontWeight="500"
      bgColor={theme.colors.white}
      textColor={theme.colors.tenantText}
      data-cy="budgeting-cta-button"
      textHoverColor={theme.colors.black}
      padding="6px 12px"
      fontSize="14px"
    >
      <FormattedMessage {...messages.allocateBudget} />
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

import React, { useEffect, useState } from 'react';

// Components
import { Button, Icon, Box, Text } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';
import useBasket from 'hooks/useBasket';

// services
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import { updateBasket } from 'services/baskets';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

export const BudgetingCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  let basketId: string | null = null;
  if (currentPhase) {
    basketId = currentPhase.relationships.user_basket?.data?.id || null;
  } else {
    basketId = project.relationships.user_basket?.data?.id || null;
  }
  const basket = useBasket(basketId);

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);
  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  let minBudget = 0;
  let maxBudget = 0;
  const submittedAt = !isNilOrError(basket)
    ? basket.attributes.submitted_at
    : null;
  const spentBudget = !isNilOrError(basket)
    ? basket.attributes.total_budget
    : 0;
  const hasUserParticipated = !!submittedAt && spentBudget > 0;

  const budgetExceedsLimit = !isNilOrError(basket)
    ? (basket.attributes['budget_exceeds_limit?'] as boolean)
    : false;
  if (currentPhase) {
    if (typeof currentPhase.attributes.voting_min_total === 'number') {
      minBudget = currentPhase.attributes.voting_min_total;
    }
    if (typeof currentPhase.attributes.voting_max_total === 'number') {
      maxBudget = currentPhase.attributes.voting_max_total;
    }
  } else if (project) {
    if (typeof project.attributes.voting_min_total === 'number') {
      minBudget = project.attributes.voting_min_total;
    }
  }

  const minBudgetRequired = minBudget > 0;
  const minBudgetReached = spentBudget >= minBudget;
  const minBudgetRequiredNotReached = minBudgetRequired && !minBudgetReached;

  const handleSubmitExpensesOnClick = async () => {
    if (!isNilOrError(basket)) {
      const now = moment().format();
      try {
        await updateBasket(basket.id, { submitted_at: now });
      } catch {
        // Do nothing
      }
    }
  };

  const CTAButton = hasUserParticipated ? (
    <Box display="flex">
      <Icon my="auto" mr="8px" name="check" fill="white" />
      <Text m="0px" color="white">
        <FormattedMessage {...messages.submitted} />
      </Text>
    </Box>
  ) : (
    <Button
      icon={hasUserParticipated ? 'check' : 'inbox'}
      buttonStyle="secondary"
      iconColor={theme.colors.tenantText}
      onClick={handleSubmitExpensesOnClick}
      fontWeight="500"
      bgColor={theme.colors.white}
      textColor={theme.colors.tenantText}
      data-cy="budgeting-cta-button"
      textHoverColor={theme.colors.black}
      padding="6px 12px"
      fontSize="14px"
      disabled={
        budgetExceedsLimit || spentBudget === 0 || minBudgetRequiredNotReached
      }
    >
      {hasUserParticipated && <FormattedMessage {...messages.submitted} />}
      {!hasUserParticipated && <FormattedMessage {...messages.submit} />}
    </Button>
  );

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={CTAButton}
      hasUserParticipated={hasUserParticipated}
      participationState={
        <Text color="white" m="0px" fontSize="s" my="0px" textAlign="left">
          {(
            maxBudget - (basket?.attributes.total_budget || 0)
          ).toLocaleString()}{' '}
          / {maxBudget.toLocaleString()}{' '}
          {appConfig?.data.attributes.settings.core.currency}{' '}
          {formatMessage(messages.left)}
        </Text>
      }
      hideParticipationMessage={true}
    />
  );
};

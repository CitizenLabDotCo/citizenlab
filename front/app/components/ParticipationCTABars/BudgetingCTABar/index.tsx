import React, { useEffect, useState } from 'react';

// Components
import { Button, Icon, Box, Text } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';
import ErrorToast from 'components/ErrorToast';

// hooks
import { useTheme } from 'styled-components';
import useBasket from 'hooks/useBasket';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { updateBasket } from 'services/baskets';

// services
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import moment from 'moment';
import { isNilOrError } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';
import { BUDGET_EXCEEDED_ERROR_EVENT } from 'components/AssignBudgetControl/constants';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

export const BudgetingCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const [showBudgetExceededError, setShowBudgetExceededError] = useState(false);
  let basketId: string | null = null;
  if (currentPhase) {
    basketId = currentPhase.relationships.user_basket?.data?.id || null;
  } else {
    basketId = project.relationships.user_basket?.data?.id || null;
  }
  const basket = useBasket(basketId);

  // Listen for budgeting exceeded error
  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(BUDGET_EXCEEDED_ERROR_EVENT)
      .subscribe(() => {
        setShowBudgetExceededError(true);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [setShowBudgetExceededError]);

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);
  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const submittedAt = basket?.attributes.submitted_at || null;
  const spentBudget = basket?.attributes.total_budget || 0;
  const hasUserParticipated = !!submittedAt && spentBudget > 0;

  const budgetExceedsLimit =
    basket?.attributes['budget_exceeds_limit?'] || false;

  const maxBudget =
    currentPhase?.attributes.voting_max_total ||
    project.attributes.voting_max_total ||
    0;
  const minBudget =
    currentPhase?.attributes.voting_min_total ||
    project.attributes.voting_min_total ||
    0;

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
      icon={hasUserParticipated ? 'check' : 'vote-ballot'}
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
    <>
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
        hideDefaultParticipationMessage={currentPhase ? true : false}
        timeLeftPosition="left"
      />
      <ErrorToast
        errorMessage={formatMessage(messages.budgetExceededError)}
        showError={showBudgetExceededError}
        onClose={() => setShowBudgetExceededError(false)}
      />
    </>
  );
};

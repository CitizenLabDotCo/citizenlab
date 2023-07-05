import React, { useEffect, useState, useMemo } from 'react';

// Components
import { Button, Icon, Box, Text } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';
import ErrorToast from 'components/ErrorToast';
import VotesCounter from 'components/VotesCounter';

// hooks
import { useTheme } from 'styled-components';
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';

// events
import { BUDGET_EXCEEDED_ERROR_EVENT } from 'components/ParticipationCTABars/VotingCTABar/events';

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import { isNilOrError } from 'utils/helperUtils';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import {
  VOTES_EXCEEDED_ERROR_EVENT,
  VOTES_PER_OPTION_EXCEEDED_ERROR_EVENT,
} from 'components/AssignMultipleVotesControl';
import useLocale from 'hooks/useLocale';

export const VotingCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPhase = useMemo(() => {
    return getCurrentPhase(phases) || getLastPhase(phases);
  }, [phases]);

  const basketId = currentPhase
    ? currentPhase.relationships.user_basket?.data?.id
    : project.relationships.user_basket?.data?.id;

  const { data: basket } = useBasket(basketId);
  const { mutate: updateBasket } = useUpdateBasket();

  // Listen for budgeting exceeded error
  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(BUDGET_EXCEEDED_ERROR_EVENT)
      .subscribe(() => {
        setError(formatMessage(messages.budgetExceededError));
        setShowError(true);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [formatMessage]);

  // Listen for voting per option exceeded error
  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(VOTES_PER_OPTION_EXCEEDED_ERROR_EVENT)
      .subscribe(() => {
        setError(formatMessage(messages.votesPerOptionExceededError));
        setShowError(true);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [formatMessage]);

  // Listen for voting exceeded error
  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(VOTES_EXCEEDED_ERROR_EVENT)
      .subscribe(() => {
        setError(formatMessage(messages.votesExceededError));
        setShowError(true);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [formatMessage]);

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const submittedAt = basket?.data.attributes.submitted_at || null;
  const spentBudget = basket?.data.attributes.total_votes || 0;
  const hasUserParticipated = !!submittedAt && spentBudget > 0;

  const budgetExceedsLimit =
    basket?.data.attributes['budget_exceeds_limit?'] || false;

  const minBudget =
    currentPhase?.attributes.voting_min_total ||
    project.attributes.voting_min_total ||
    0;

  const minBudgetRequired = minBudget > 0;
  const minBudgetReached = spentBudget >= minBudget;
  const minBudgetRequiredNotReached = minBudgetRequired && !minBudgetReached;

  if (isNilOrError(locale)) {
    return null;
  }

  const handleSubmitOnClick = async () => {
    if (!isNilOrError(basket)) {
      updateBasket({
        id: basket.data.id,
        submitted: true,
        participation_context_type: currentPhase ? 'Phase' : 'Project',
      });
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
      onClick={handleSubmitOnClick}
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
      <FormattedMessage {...messages.submit} />
    </Button>
  );

  return (
    <>
      <ParticipationCTAContent
        project={project}
        currentPhase={currentPhase}
        CTAButton={CTAButton}
        hasUserParticipated={hasUserParticipated}
        participationState={
          hasUserParticipated ? undefined : (
            <Text
              color="white"
              m="0px"
              fontSize="s"
              my="0px"
              textAlign="left"
              aria-live="polite"
            >
              <VotesCounter projectId={project.id} />
            </Text>
          )
        }
        hideDefaultParticipationMessage={currentPhase ? true : false}
        timeLeftPosition="left"
      />
      <ErrorToast
        errorMessage={error || ''}
        showError={showError}
        onClose={() => setShowError(false)}
        aria-live="polite"
      />
    </>
  );
};

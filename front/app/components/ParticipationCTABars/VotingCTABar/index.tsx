import React, { useEffect, useState } from 'react';

// Components
import { Button, Icon, Box, Text } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';
import ErrorToast from 'components/ErrorToast';

// hooks
import { useTheme } from 'styled-components';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';

// services
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';

// events
import { BUDGET_EXCEEDED_ERROR_EVENT } from 'components/ParticipationCTABars/VotingCTABar/events';

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import { isNilOrError } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';
import { getVotingMethodConfig } from 'utils/votingMethodUtils/votingMethodUtils';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import {
  VOTES_EXCEEDED_ERROR_EVENT,
  VOTES_PER_OPTION_EXCEEDED_ERROR_EVENT,
} from 'components/AssignMultipleVotesControl';
import useLocale from 'hooks/useLocale';
import useBasketsIdeas from 'api/baskets_ideas/useBasketsIdeas';

export const VotingCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  let basketId: string | undefined;
  if (currentPhase) {
    basketId = currentPhase.relationships.user_basket?.data?.id;
  } else {
    basketId = project.relationships.user_basket?.data?.id;
  }
  const { data: basket } = useBasket(basketId);
  const { mutate: updateBasket } = useUpdateBasket();
  const { data: basketsIdeas } = useBasketsIdeas(basket?.data.id);

  console.log({ basketsIdeas });

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

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);
  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const submittedAt = basket?.data.attributes.submitted_at || null;
  const spentBudget = basket?.data.attributes.total_votes || 0;
  const hasUserParticipated = !!submittedAt && spentBudget > 0;

  const budgetExceedsLimit =
    basket?.data.attributes['budget_exceeds_limit?'] || false;

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

  const getVoteTerm = () => {
    const voteConfig = getVotingMethodConfig(
      currentPhase?.attributes?.voting_method ||
        project.attributes.voting_method
    );
    if (!voteConfig?.useVoteTerm) {
      return null;
    }
    if (currentPhase && currentPhase.attributes.voting_term_plural_multiloc) {
      return currentPhase?.attributes?.voting_term_plural_multiloc[
        locale
      ]?.toLowerCase();
    } else if (project.attributes.voting_term_plural_multiloc) {
      return project.attributes.voting_term_plural_multiloc[
        locale
      ]?.toLowerCase();
    }
    return null;
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
              {(
                maxBudget - (basket?.data.attributes.total_votes || 0)
              ).toLocaleString()}{' '}
              / {maxBudget.toLocaleString()}{' '}
              {getVoteTerm() ||
                appConfig?.data.attributes.settings.core.currency}{' '}
              {formatMessage(messages.left)}
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
      />
    </>
  );
};

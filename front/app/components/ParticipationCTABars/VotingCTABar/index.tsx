import React, { useState, useMemo } from 'react';
import JSConfetti from 'js-confetti';

// Components
import { Button, Icon, Box, Text } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';
import ErrorToast from 'components/ErrorToast';
import Tippy from '@tippyjs/react';

// hooks
import { useTheme } from 'styled-components';
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import { isNilOrError } from 'utils/helperUtils';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { getDisabledMessage } from './utils';
import { scrollToElement } from 'utils/scroll';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import ownMessages from './messages';

const confetti = new JSConfetti();

export const VotingCTABar = ({ phases, project }: CTABarProps) => {
  const [processing, setProcessing] = useState(false);
  const theme = useTheme();
  const { numberOfVotesCast, processing: votingProcessing } = useVoting();
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();

  const currentPhase = useMemo(() => {
    return getCurrentPhase(phases) || getLastPhase(phases);
  }, [phases]);

  const participationContext = currentPhase ?? project;
  const basketId = participationContext.relationships.user_basket?.data?.id;

  participationContext.attributes.voting_method;

  const { data: basket } = useBasket(basketId);
  const { mutate: updateBasket } = useUpdateBasket();

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const submittedAt = basket?.data.attributes.submitted_at || null;
  const hasUserParticipated = !!submittedAt;

  const minVotes = participationContext.attributes.voting_min_total ?? 0;
  const maxVotes = participationContext.attributes.voting_max_total;

  const minVotesRequired = minVotes > 0;
  const minVotesReached =
    numberOfVotesCast !== undefined ? numberOfVotesCast >= minVotes : false;
  const minVotesRequiredNotReached = minVotesRequired && !minVotesReached;
  const votesExceedLimit =
    maxVotes && numberOfVotesCast !== undefined
      ? numberOfVotesCast > maxVotes
      : false;

  const handleSubmitOnClick = () => {
    if (!isNilOrError(basket)) {
      const update = () => {
        updateBasket(
          {
            id: basket.data.id,
            submitted: true,
            participation_context_type: currentPhase ? 'Phase' : 'Project',
          },
          {
            onSuccess: () => {
              setProcessing(false);
              confetti.addConfetti();
              scrollToElement({
                id: 'voting-status-module',
              });
            },
          }
        );
      };

      if (votingProcessing) {
        // Add a bit of timeout so that the voting request
        // has time to complete
        setTimeout(() => {
          update();
        }, 300);
      } else {
        update();
      }
    }
  };

  const votingMethod = participationContext.attributes.voting_method;
  if (!votingMethod || numberOfVotesCast === undefined) return null;

  const disabledMessage = getDisabledMessage(
    votingMethod,
    votesExceedLimit,
    numberOfVotesCast,
    minVotesRequiredNotReached
  );

  const disabledExplanation = disabledMessage
    ? formatMessage(disabledMessage, {
        votesCast: numberOfVotesCast,
        votesLimit: maxVotes || 0,
        votesMinimum: minVotes,
      })
    : undefined;

  const getVotesLeftMessage = () => {
    if (votingMethod === 'single_voting') {
      return maxVotes
        ? formatMessage(ownMessages.votesLeft, {
            // TODO
          })
        : formatMessage;
    }

    const votesLeft = (maxVotes ?? 0) - (numberOfVotesCast ?? 0);

    if (votingMethod === 'multiple_voting') {
      return; // TODO
    }

    if (votingMethod === 'budgeting') {
      const currency = appConfig?.data.attributes.settings.core.currency;

      return formatMessage(ownMessages.currencyLeft, {});
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
    <Tippy
      disabled={!disabledExplanation}
      interactive={true}
      placement="bottom"
      content={disabledExplanation}
    >
      <div>
        <Button
          icon="vote-ballot"
          buttonStyle="secondary"
          iconColor={theme.colors.tenantText}
          onClick={handleSubmitOnClick}
          fontWeight="500"
          bgColor={theme.colors.white}
          textColor={theme.colors.tenantText}
          id="e2e-voting-submit-button"
          textHoverColor={theme.colors.black}
          padding="6px 12px"
          fontSize="14px"
          disabled={!!disabledExplanation}
          processing={processing}
        >
          <FormattedMessage {...messages.submit} />
        </Button>
      </div>
    </Tippy>
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
              {/* <VotesCounter participationContext={participationContext} /> */}
            </Text>
          )
        }
        hideDefaultParticipationMessage={currentPhase ? true : false}
        timeLeftPosition="left"
      />
      <ErrorToast />
    </>
  );
};

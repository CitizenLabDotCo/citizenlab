import React, { useState, useMemo } from 'react';

// Components
import { Button, Icon, Box, Text } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';
import ErrorToast from 'components/ErrorToast';
import VotesCounter from 'components/VotesCounter';

// hooks
import { useTheme } from 'styled-components';
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useVoting from 'api/baskets_ideas/useVoting';

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import { isNilOrError } from 'utils/helperUtils';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export const VotingCTABar = ({ phases, project }: CTABarProps) => {
  const [processing, setProcessing] = useState(false);
  const theme = useTheme();
  const { numberOfVotesCast, processing: votingProcessing } = useVoting();

  const currentPhase = useMemo(() => {
    return getCurrentPhase(phases) || getLastPhase(phases);
  }, [phases]);

  const participationContext = currentPhase ?? project;
  const basketId = participationContext.relationships.user_basket?.data?.id;

  const { data: basket } = useBasket(basketId);
  const { mutate: updateBasket } = useUpdateBasket();

  if (
    hasProjectEndedOrIsArchived(project, currentPhase) ||
    numberOfVotesCast === undefined
  ) {
    return null;
  }

  const submittedAt = basket?.data.attributes.submitted_at || null;
  const hasUserParticipated = !!submittedAt;

  const minVotes = participationContext.attributes.voting_min_total ?? 0;
  const maxVotes = participationContext.attributes.voting_max_total ?? 0;

  const minVotesRequired = minVotes > 0;
  const minVotesReached = numberOfVotesCast >= minVotes;
  const minVotesRequiredNotReached = minVotesRequired && !minVotesReached;
  const votesExceedLimit = numberOfVotesCast > maxVotes;

  const handleSubmitOnClick = () => {
    if (!isNilOrError(basket)) {
      if (votingProcessing) {
        // Add a bit of timeout so that the voting request
        // has time to complete
        setTimeout(() => {
          updateBasket(
            {
              id: basket.data.id,
              submitted: true,
              participation_context_type: currentPhase ? 'Phase' : 'Project',
            },
            {
              onSuccess: () => setProcessing(false),
            }
          );
        }, 300);
      } else {
        updateBasket(
          {
            id: basket.data.id,
            submitted: true,
            participation_context_type: currentPhase ? 'Phase' : 'Project',
          },
          {
            onSuccess: () => setProcessing(false),
          }
        );
      }
    }
  };

  const ctaDisabled =
    votesExceedLimit || numberOfVotesCast === 0 || minVotesRequiredNotReached;

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
      disabled={ctaDisabled}
      processing={processing}
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
              <VotesCounter participationContext={participationContext} />
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

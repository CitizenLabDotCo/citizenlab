import React, { useMemo } from 'react';

// Components
import { Button, Icon, Box, Text } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';
import ErrorToast from 'components/ErrorToast';
import VotesCounter from 'components/VotesCounter';

// hooks
import { useTheme } from 'styled-components';
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useCumulativeVoting from 'api/baskets_ideas/useCumulativeVoting';

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
import useLocale from 'hooks/useLocale';
import useBasketsIdeas from 'api/baskets_ideas/useBasketsIdeas';

export const VotingCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const locale = useLocale();
  const { processing: cumulativeVotesProcessing } = useCumulativeVoting();

  console.log({ cumulativeVotesProcessing });

  const currentPhase = useMemo(() => {
    return getCurrentPhase(phases) || getLastPhase(phases);
  }, [phases]);

  const basketId = currentPhase
    ? currentPhase.relationships.user_basket?.data?.id
    : project.relationships.user_basket?.data?.id;

  const { data: basket } = useBasket(basketId);
  const { mutate: updateBasket } = useUpdateBasket();
  const { data: basketsIdeas } = useBasketsIdeas(basket?.data.id);

  const currentBasketsIdeas: { ideaId: string; votes: number }[] = [];

  basketsIdeas?.data.map((basketIdea) => {
    const ideaId = basketIdea.relationships.idea.data['id'];
    const votes = basketIdea.attributes.votes;
    currentBasketsIdeas.push({ ideaId, votes });
  });

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const submittedAt = basket?.data.attributes.submitted_at || null;
  const votesCast = basket?.data.attributes.total_votes || 0;
  const hasUserParticipated = !!submittedAt && votesCast > 0;

  const voteExceedsLimit =
    basket?.data.attributes['budget_exceeds_limit?'] || false;

  const minVotes =
    currentPhase?.attributes.voting_min_total ||
    project.attributes.voting_min_total ||
    0;

  const minVotesRequired = minVotes > 0;
  const minVotesReached = votesCast >= minVotes;
  const minVotesRequiredNotReached = minVotesRequired && !minVotesReached;

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

  const ctaDisabled =
    voteExceedsLimit ||
    votesCast === 0 ||
    minVotesRequiredNotReached ||
    cumulativeVotesProcessing;

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
      <ErrorToast />
    </>
  );
};

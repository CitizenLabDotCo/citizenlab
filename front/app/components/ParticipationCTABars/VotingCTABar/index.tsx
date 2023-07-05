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

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import { isNilOrError } from 'utils/helperUtils';
import { getVotingMethodConfig } from 'utils/votingMethodUtils/votingMethodUtils';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import useLocale from 'hooks/useLocale';
import useBasketsIdeas from 'api/baskets_ideas/useBasketsIdeas';

export const VotingCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const basketId: string | undefined =
    currentPhase?.relationships?.user_basket?.data?.id ||
    project.relationships.user_basket?.data?.id;
  const { data: basket } = useBasket(basketId);
  const { mutate: updateBasket } = useUpdateBasket();
  const { data: basketsIdeas } = useBasketsIdeas(basket?.data.id);

  const currentBasketsIdeas: { ideaId: string; votes: number }[] = [];

  basketsIdeas?.data.map((basketIdea) => {
    const ideaId = basketIdea.relationships.idea.data['id'];
    const votes = basketIdea.attributes.votes;
    currentBasketsIdeas.push({ ideaId, votes });
  });

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);
  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const submittedAt = basket?.data.attributes.submitted_at || null;
  const votesCast = basket?.data.attributes.total_votes || 0;
  const hasUserParticipated = !!submittedAt && votesCast > 0;

  const voteExceedsLimit =
    basket?.data.attributes['budget_exceeds_limit?'] || false;

  const maxVotes =
    currentPhase?.attributes.voting_max_total ||
    project.attributes.voting_max_total ||
    null;
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

  const ctaDisabled =
    voteExceedsLimit || votesCast === 0 || minVotesRequiredNotReached;

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
          hasUserParticipated || !maxVotes ? undefined : (
            <Text
              color="white"
              m="0px"
              fontSize="s"
              my="0px"
              textAlign="left"
              aria-live="polite"
            >
              {(
                maxVotes - (basket?.data.attributes.total_votes || 0)
              ).toLocaleString()}{' '}
              / {maxVotes.toLocaleString()}{' '}
              {getVoteTerm() ||
                appConfig?.data.attributes.settings.core.currency}{' '}
              {formatMessage(messages.left)}
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

import React, { useMemo } from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';
import ErrorToast from 'components/ErrorToast';
import CTAButton from './CTAButton';

// hooks
import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// i18n
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { getVotesCounter } from './utils';

export const VotingCTABar = ({ phases, project }: CTABarProps) => {
  const { numberOfVotesCast } = useVoting();
  const { data: appConfig } = useAppConfiguration();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const currentPhase = useMemo(() => {
    return getCurrentPhase(phases) || getLastPhase(phases);
  }, [phases]);

  const participationContext = currentPhase ?? project;
  const basketId = participationContext.relationships.user_basket?.data?.id;

  const { data: basket } = useBasket(basketId);

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const votingMethod = participationContext.attributes.voting_method;
  if (!votingMethod || numberOfVotesCast === undefined) return null;

  const currency = appConfig?.data.attributes.settings.core.currency;

  const votesCounter = getVotesCounter(
    formatMessage,
    localize,
    participationContext,
    numberOfVotesCast,
    currency
  );

  const submittedAt = basket?.data.attributes.submitted_at || null;
  const hasUserParticipated = !!submittedAt;

  return (
    <>
      <ParticipationCTAContent
        project={project}
        currentPhase={currentPhase}
        CTAButton={<CTAButton participationContext={participationContext} />}
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
              {votesCounter}
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

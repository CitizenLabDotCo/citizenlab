import React, { useMemo } from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import ErrorToast from 'components/ErrorToast';
import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

import { useIntl } from 'utils/cl-intl';

import CTAButton from './CTAButton';
import { getVotesCounter } from './utils';

const VotingCTABar = ({ phases, project }: CTABarProps) => {
  const { numberOfVotesCast } = useVoting();
  const { data: appConfig } = useAppConfiguration();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const currentPhase = useMemo(() => {
    return getCurrentPhase(phases) || getLastPhase(phases);
  }, [phases]);

  const basketId = currentPhase?.relationships.user_basket?.data?.id;

  const { data: basket } = useBasket(basketId);

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const votingMethod = currentPhase?.attributes.voting_method;
  if (!votingMethod || numberOfVotesCast === undefined) return null;

  const currency = appConfig?.data.attributes.settings.core.currency;

  const votesCounter = getVotesCounter(
    formatMessage,
    localize,
    currentPhase,
    numberOfVotesCast,
    currency
  );

  const submittedAt = basket?.data.attributes.submitted_at || null;
  const hasUserParticipated = !!submittedAt;

  return (
    <>
      {hasUserParticipated ? (
        <ParticipationCTAContent
          currentPhase={currentPhase}
          hasUserParticipated
        />
      ) : (
        <ParticipationCTAContent
          currentPhase={currentPhase}
          hasUserParticipated={false}
          CTAButton={<CTAButton project={project} phase={currentPhase} />}
          participationState={
            <Text color="white" m="0px" fontSize="s" aria-live="polite">
              {votesCounter}
            </Text>
          }
        />
      )}
      <ErrorToast />
    </>
  );
};

export default VotingCTABar;

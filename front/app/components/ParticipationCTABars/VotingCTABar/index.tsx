import React, { useMemo } from 'react';

import { Text, Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';

import ErrorToast from 'components/ErrorToast';
import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

import { useIntl } from 'utils/cl-intl';
import useFormatCurrency from 'utils/currency/useFormatCurrency';

import CTAButton from './CTAButton';
import { getOptionSelectionCounter, getVotesCounter } from './utils';

const VotingCTABar = ({ phases, project }: CTABarProps) => {
  const isMobileOrSmaller = useBreakpoint('phone');
  const { numberOfVotesCast, numberOfOptionsSelected } = useVoting();
  const { formatMessage } = useIntl();
  const formatCurrency = useFormatCurrency();

  const currentPhase = useMemo(() => {
    return getCurrentPhase(phases) || getLastPhase(phases);
  }, [phases]);

  const basketId = currentPhase?.relationships.user_basket?.data?.id;

  const { data: basket } = useBasket(basketId);

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const votingMethod = currentPhase?.attributes.voting_method;
  if (!votingMethod || numberOfVotesCast === undefined) {
    return null;
  }

  const votesCounter = getVotesCounter(
    formatMessage,
    currentPhase,
    numberOfVotesCast,
    formatCurrency
  );

  const optionSelectionCounter = getOptionSelectionCounter(
    formatMessage,
    currentPhase,
    numberOfOptionsSelected
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
            <Box ml="21px" display={isMobileOrSmaller ? 'block' : 'flex'}>
              <Text
                color="white"
                m="0px"
                mr="4px"
                fontSize="s"
                aria-live="polite"
              >
                {votesCounter}
              </Text>
              {optionSelectionCounter && (
                <Text color="white" m="0px" fontSize="s" aria-live="polite">
                  {isMobileOrSmaller ? '' : ' • '}
                  {optionSelectionCounter}
                </Text>
              )}
            </Box>
          }
        />
      )}
      <ErrorToast />
    </>
  );
};

export default VotingCTABar;

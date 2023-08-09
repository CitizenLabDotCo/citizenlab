import React, { useMemo } from 'react';

// Components
import { Text } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';
import ErrorToast from 'components/ErrorToast';
import CTAButton from './CTAButton';

// hooks
import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';
// import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';

export const VotingCTABar = ({ phases, project }: CTABarProps) => {
  const { numberOfVotesCast } = useVoting();
  // const { data: appConfig } = useAppConfiguration();

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
